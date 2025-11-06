// AccessibilityValidator.ts — Reusable accessibility validation module for any widgets
// Bundles axe-core directly - no manual script loading required.
// Scans configurable widget selectors with automatic revalidation on content changes.
// Features: MutationObserver, CMS event handling, debounced rechecks.

import axe from 'axe-core';

// Type definitions for axe-core
interface AxeResults {
    violations: AxeViolation[];
    passes: AxePass[];
    incomplete: AxeIncomplete[];
    inapplicable: AxeInapplicable[];
}

interface AxeViolation {
    id: string;
    impact?: 'minor' | 'moderate' | 'serious' | 'critical';
    tags: string[];
    description: string;
    help: string;
    helpUrl: string;
    nodes: AxeNode[];
}

interface AxePass {
    id: string;
    impact?: string;
    tags: string[];
    description: string;
    help: string;
    helpUrl: string;
    nodes: AxeNode[];
}

interface AxeIncomplete {
    id: string;
    impact?: string;
    tags: string[];
    description: string;
    help: string;
    helpUrl: string;
    nodes: AxeNode[];
}

interface AxeInapplicable {
    id: string;
    impact?: string;
    tags: string[];
    description: string;
    help: string;
    helpUrl: string;
    nodes: AxeNode[];
}

interface AxeNode {
    any: AxeCheckResult[];
    all: AxeCheckResult[];
    none: AxeCheckResult[];
    impact?: 'minor' | 'moderate' | 'serious' | 'critical';
    html: string;
    target: string[];
    failureSummary?: string;
}

interface AxeCheckResult {
    id: string;
    impact: string;
    message: string;
    data: any;
    relatedNodes: AxeRelatedNode[];
}

interface AxeRelatedNode {
    target: string[];
    html: string;
}

interface AxeRunOptions {
    runOnly?: {
        type: 'rule' | 'tag';
        values: string[];
    };
    rules?: { [key: string]: { enabled: boolean } };
    tags?: string[];
    include?: string[][];
    exclude?: string[][];
    iframes?: boolean;
}

// Axe global interface (type for imported axe-core)
interface AxeCore {
    run(context?: Element | Document | string, options?: AxeRunOptions): Promise<AxeResults>;
    configure(config: any): void;
    getRules(): any[];
}

// Make axe available globally for backward compatibility
declare global {
    interface Window {
        axe?: AxeCore;
        AccessibilityValidator?: typeof AccessibilityValidator;
    }
}

// Configuration interface for the accessibility validator
interface AccessibilityValidatorConfig {
    /** CSS selectors for widgets to validate (required) */
    widgetSelectors: string[];
    
    /** 
     * Axe-core rules to run (optional)
     * - Empty array or undefined = run ALL rules
     * - Specific rule IDs = run only those rules
     * - Cannot be used with axeTags
     */
    axeRules?: string[];
    
    /** 
     * Axe-core tags to run (optional, alternative to axeRules)
     * - Common tags: 'wcag2a', 'wcag2aa', 'wcag2aaa', 'section508', 'best-practice'
     * - Cannot be used with axeRules
     */
    axeTags?: string[];
    
    /** Debounce delay in milliseconds (optional, defaults to 300) */
    debounceDelay?: number;
    
    /** Enable MutationObserver for real-time updates (optional, defaults to true) */
    enableMutationObserver?: boolean;
    
    /** Maximum retry attempts for axe failures (optional, defaults to 1) */
    maxRetries?: number;
    
    /** Custom CSS class names for UI elements (optional) */
    uiClasses?: Partial<UIClasses>;
    
    /** CMS-specific event names to listen for (optional) */
    cmsEvents?: string[];
    
    /** Custom CSS styles (optional, will merge with defaults) */
    customCSS?: string;
    
    /** Enable debug logging (optional, defaults to dev environment detection) */
    enableDebugLogging?: boolean;
}

// Internal type definitions
interface WidgetState {
    lastViolationCount: number;
    hasUI: boolean;
}

interface UIClasses {
    readonly OUTLINE: string;
    readonly BADGE: string;
    readonly POPUP: string;
    readonly CLOSE: string;
}

interface ViolationSummary {
    id: string;
    nodes: number;
    description: string;
}

interface AccessibilityValidatorAPI {
    recheckAll: () => Promise<void>;
    debounceRecheck: (delay?: number) => void;
    startWatching: () => void;
    stopWatching: () => void;
    clearAll: () => void;
    addSelectors: (selectors: string[]) => void;
    removeSelectors: (selectors: string[]) => void;
    updateConfig: (config: Partial<AccessibilityValidatorConfig>) => void;
    getWidgetStates: () => Array<{ element: Element; state: WidgetState }>;
    getConfig: () => AccessibilityValidatorConfig;
    destroy: () => void;
}

interface WidgetStateInfo {
    element: Element;
    state: WidgetState;
}

interface PopupElement extends HTMLDivElement {
    _outsideClickHandler?: (e: Event) => void;
}

/**
 * AccessibilityValidator - Reusable accessibility validation module
 */
class AccessibilityValidator implements AccessibilityValidatorAPI {
    private config: AccessibilityValidatorConfig;
    private widgetCache = new WeakMap<Element, WidgetState>();
    private recheckTimeout: number | undefined;
    private mutationObserver: MutationObserver | null = null;
    private isInitialized = false;
    private uiClasses: UIClasses;

    // Default configuration
    private static readonly DEFAULT_CONFIG: Omit<AccessibilityValidatorConfig, 'widgetSelectors'> = {
        axeRules: [], // Empty array = run ALL rules (comment out specific rules to run everything)
        // Alternative: Use specific rules for targeted checking
        // axeRules: [
        //     'image-alt',
        //     'role-img-alt', 
        //     'link-name',
        //     'image-redundant-alt',
        //     'svg-img-alt',
        //     'identical-links-same-purpose'
        // ],
        debounceDelay: 300,
        enableMutationObserver: true,
        maxRetries: 1,
        cmsEvents: [
            'sf:contentModified',
            'sf:widgetUpdated', 
            'sf:propertyChanged',
            'sf:designerClosed',
            'sf:contentSaved'
        ]
    };

    private static readonly A11Y_ATTRIBUTES: readonly string[] = [
        'alt', 'src', 'href', 'title', 'aria-label', 'aria-labelledby', 'role'
    ] as const;

    constructor(config: AccessibilityValidatorConfig) {
        this.config = this.mergeConfig(config);
        this.uiClasses = this.createUIClasses();
        // Make axe available globally for backward compatibility
        if (typeof window !== 'undefined') {
            window.axe = axe;
        }
        this.initialize();
    }

    /**
     * Merge user config with defaults
     */
    private mergeConfig(userConfig: AccessibilityValidatorConfig): AccessibilityValidatorConfig {
        const merged = {
            ...AccessibilityValidator.DEFAULT_CONFIG,
            ...userConfig,
            axeRules: userConfig.axeRules || AccessibilityValidator.DEFAULT_CONFIG.axeRules!,
            cmsEvents: userConfig.cmsEvents || AccessibilityValidator.DEFAULT_CONFIG.cmsEvents!
        };

        // Auto-detect debug logging if not specified
        if (merged.enableDebugLogging === undefined) {
            merged.enableDebugLogging = window.location.hostname === 'localhost' || 
                                      window.location.hostname.includes('dev');
        }

        return merged;
    }

    /**
     * Create UI class names (allow customization)
     */
    private createUIClasses(): UIClasses {
        const defaults: UIClasses = {
            OUTLINE: 'wa11y-outline',
            BADGE: 'wa11y-badge',
            POPUP: 'wa11y-popup',
            CLOSE: 'wa11y-close'
        };

        return { ...defaults, ...(this.config.uiClasses || {}) } as UIClasses;
    }

    /**
     * Initialize the validator
     */
    private initialize(): void {
        if (this.isInitialized) return;
        
        this.injectCSS();
        this.setupEventListeners();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
        
        this.isInitialized = true;
    }

    /**
     * Start validation and watching
     */
    private start(): void {
        this.recheckAll();
        if (this.config.enableMutationObserver) {
            this.startWatching();
        }
    }

    /**
     * Get combined selector string
     */
    private getCombinedSelector(): string {
        return this.config.widgetSelectors.join(', ');
    }

    /**
     * Check if element matches any widget selector
     */
    private isTargetWidget(element: Element): boolean {
        return this.config.widgetSelectors.some(selector => element.matches(selector));
    }

    /**
     * Check if element contains any widgets
     */
    private containsWidget(element: Element): boolean {
        return this.config.widgetSelectors.some(selector => element.querySelector(selector) !== null);
    }

    /**
     * Check if element is inside any widget
     */
    private isInsideWidget(element: Element): boolean {
        return this.config.widgetSelectors.some(selector => element.closest(selector) !== null);
    }

    /**
     * Get all widgets in document
     */
    private getAllWidgets(): NodeListOf<Element> {
        return document.querySelectorAll(this.getCombinedSelector());
    }

    /**
     * Check if element is our UI component
     */
    private isOurUIElement(element: Element | null): boolean {
        if (!element?.classList) return false;
        
        return (
            element.classList.contains(this.uiClasses.BADGE) ||
            element.classList.contains(this.uiClasses.POPUP) ||
            element.closest(`.${this.uiClasses.BADGE}`) !== null ||
            element.closest(`.${this.uiClasses.POPUP}`) !== null
        );
    }

    /**
     * Check if mutation affects widgets
     */
    private affectsWidget(mutation: MutationRecord): boolean {
        const target = mutation.target as Element;
        return (
            this.isTargetWidget(target) ||
            this.containsWidget(target) ||
            this.isInsideWidget(target)
        );
    }

    /**
     * Widget state management
     */
    private getWidgetState(widget: Element): WidgetState {
        return this.widgetCache.get(widget) || { lastViolationCount: -1, hasUI: false };
    }
    
    private setWidgetState(widget: Element, state: Partial<WidgetState>): void {
        this.widgetCache.set(widget, { ...this.getWidgetState(widget), ...state });
    }

    /**
     * Create UI elements
     */
    private createBadge(violationCount: number): HTMLButtonElement {
        const btn: HTMLButtonElement = document.createElement('button');
        btn.type = 'button';
        btn.className = this.uiClasses.BADGE;
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.setAttribute('aria-expanded', 'false');
        btn.title = 'Show accessibility issues for this widget';
        btn.innerHTML = `
            <span class="${this.uiClasses.BADGE}__icon" aria-hidden="true">
                ${this.createIcon()}
            </span>
            ${violationCount} ${violationCount === 1 ? 'issue' : 'issues'}
        `;
        return btn;
    }

    private createPopup(violations: AxeViolation[]): PopupElement {
        const popup: PopupElement = document.createElement('div') as PopupElement;
        popup.className = this.uiClasses.POPUP;
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-modal', 'false');
        popup.setAttribute('hidden', '');
        popup.innerHTML = `
            <div class="${this.uiClasses.POPUP}__hdr">
                <h2 class="${this.uiClasses.POPUP}__ttl">Widget accessibility</h2>
                <button type="button" class="${this.uiClasses.CLOSE}" aria-label="Close">${this.createCloseIcon()}</button>
            </div>
            <ul class="wa11y-list">
                ${violations.map(this.formatViolation.bind(this)).join('')}
            </ul>
        `;
        return popup;
    }

    private createIcon(): string {
        return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l9 16H3L12 3z" stroke="#f0b429" stroke-width="1.5" fill="none"/>
            <path d="M12 8v6" stroke="#f0b429" stroke-width="1.5"/>
            <circle cx="12" cy="16.5" r="1" fill="#f0b429"/>
        </svg>`;
    }

    private createCloseIcon(): string {
        return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    }

    private formatViolation(violation: AxeViolation): string {
        return `<li class="wa11y-item">
            <div class="wa11y-rule">[${violation.id}] ${violation.impact ?? ''}</div>
            <div class="wa11y-msg">${violation.help || violation.description || ''}</div>
        </li>`;
    }

    /**
     * Setup UI interactions
     */
    private setupUIInteractions(btn: HTMLButtonElement, popup: PopupElement, widget: Element): void {
        const open = (): void => {
            popup.removeAttribute('hidden');
            btn.setAttribute('aria-expanded', 'true');
        };
        
        const close = (): void => {
            popup.setAttribute('hidden', '');
            btn.setAttribute('aria-expanded', 'false');
        };

        const closeOthers = (): void => {
            document.querySelectorAll<HTMLElement>(`.${this.uiClasses.POPUP}:not([hidden])`).forEach(p => {
                if (p !== popup) p.setAttribute('hidden', '');
            });
        };

        btn.addEventListener('click', (e: Event): void => {
            e.stopPropagation();
            const willOpen: boolean = popup.hasAttribute('hidden');
            closeOthers();
            willOpen ? open() : close();
        });

        const closeButton = popup.querySelector<HTMLButtonElement>(`.${this.uiClasses.CLOSE}`);
        if (closeButton) {
            closeButton.addEventListener('click', (e: Event): void => {
                e.stopPropagation();
                close();
            });
        }

        const outsideClickHandler = (e: Event): void => {
            if (e.target && !widget.contains(e.target as Node)) close();
        };
        document.addEventListener('click', outsideClickHandler);
        popup._outsideClickHandler = outsideClickHandler;
    }

    /**
     * UI management
     */
    private clearWidgetUI(widget: Element): void {
        widget.classList.remove(this.uiClasses.OUTLINE);
        widget.querySelectorAll<HTMLElement>(`:scope > .${this.uiClasses.BADGE}, :scope > .${this.uiClasses.POPUP}`).forEach(n => n.remove());
        this.setWidgetState(widget, { hasUI: false, lastViolationCount: 0 });
    }

    private renderWidgetUI(widget: Element, violations: AxeViolation[]): void {
        const currentState: WidgetState = this.getWidgetState(widget);
        const violationCount: number = violations.length;
        
        if (currentState.lastViolationCount === violationCount && currentState.hasUI === (violationCount > 0)) {
            return;
        }
        
        if (!violationCount) {
            this.clearWidgetUI(widget);
            return;
        }
        
        this.clearWidgetUI(widget);
        widget.classList.add(this.uiClasses.OUTLINE);

        const btn: HTMLButtonElement = this.createBadge(violationCount);
        const popup: PopupElement = this.createPopup(violations);
        
        widget.appendChild(btn);
        widget.appendChild(popup);
        
        this.setupUIInteractions(btn, popup, widget);
        this.setWidgetState(widget, { hasUI: true, lastViolationCount: violationCount });
    }

    /**
     * CSS injection
     */
    private injectCSS(): void {
        if (document.getElementById('wa11y-style')) return;

        const defaultCSS = `
        .${this.uiClasses.OUTLINE}{outline:2px solid #e33;outline-offset:2px;position:relative}
        .${this.uiClasses.BADGE}{position:absolute;top:6px;right:6px;z-index:99998;display:inline-flex;align-items:center;gap:6px;background:#111;color:#fff;border:1px solid #333;border-radius:999px;font:12px/1 system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:4px 8px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)}
        .${this.uiClasses.BADGE}__icon{width:14px;height:14px;display:inline-block}
        .${this.uiClasses.BADGE}__icon svg{width:14px;height:14px;display:block}
        .${this.uiClasses.POPUP}{position:absolute;top:36px;right:6px;z-index:99999;width:320px;max-width:calc(100vw - 32px);background:#1a1a1a;color:#fff;border:1px solid #333;padding:10px;box-shadow:0 10px 24px rgba(0,0,0,.35)}
        .${this.uiClasses.POPUP}[hidden]{display:none}
        .${this.uiClasses.POPUP} *{margin-top:0}
        .${this.uiClasses.POPUP}__hdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
        .${this.uiClasses.POPUP}__ttl{margin:0;font:600 12px/1.3 system-ui;color:#9ee6a7}
        .${this.uiClasses.CLOSE}{min-height:0;background:none;border:none;color:#fff;cursor:pointer;padding:0;width:16px;height:16px;display:flex;align-items:center;justify-content:center}
        .${this.uiClasses.CLOSE} svg{width:12px;height:12px;stroke:currentColor}
        .wa11y-list{margin:0;padding:0;list-style:none;max-height:320px;overflow:auto}
        .wa11y-item{padding:0}
        .wa11y-item+.wa11y-item{margin-top:10px}
        .wa11y-rule{font:600 11px/1.2 system-ui;color:#ddd;margin-bottom:2px}
        .wa11y-msg{font:12px/1.35 system-ui;color:#cfcfcf}
        `;

        const s: HTMLStyleElement = document.createElement('style');
        s.id = 'wa11y-style';
        s.textContent = defaultCSS + (this.config.customCSS || '');
        document.head.appendChild(s);
    }

    /**
     * Event handling setup
     */
    private setupEventListeners(): void {
        // Listen for custom recheck events
        window.addEventListener('wa11y:recheck', () => this.recheckAll());
        
        // Listen for CMS events
        if (this.config.cmsEvents) {
            this.config.cmsEvents.forEach((eventName: string): void => {
                document.addEventListener(eventName, () => this.debounceRecheck(500));
            });
        }

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.destroy());
    }

    /**
     * Mutation observer setup
     */
    private setupMutationObserver(): void {
        if (this.mutationObserver) return;
        
        this.mutationObserver = new MutationObserver((mutations: MutationRecord[]): void => {
            let shouldRecheck: boolean = false;
            
            for (const mutation of mutations) {
                if (this.isOurUIElement(mutation.target as Element)) continue;
                
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    (mutation.target as Element).classList.contains(this.uiClasses.OUTLINE)) {
                    continue;
                }
                
                if (mutation.type === 'childList') {
                    const allNodes: Node[] = [
                        ...Array.from(mutation.addedNodes), 
                        ...Array.from(mutation.removedNodes)
                    ];
                    const isOurUI: boolean = allNodes.some(node => 
                        node.nodeType === Node.ELEMENT_NODE && this.isOurUIElement(node as Element)
                    );
                    if (isOurUI) continue;
                }
                
                if (this.affectsWidget(mutation)) {
                    if (mutation.type === 'childList') {
                        shouldRecheck = true;
                        break;
                    } else if (mutation.type === 'attributes' && 
                             AccessibilityValidator.A11Y_ATTRIBUTES.includes(mutation.attributeName as string)) {
                        shouldRecheck = true;
                        break;
                    }
                }
            }
            
            if (shouldRecheck) {
                this.debounceRecheck();
            }
        });
        
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [...AccessibilityValidator.A11Y_ATTRIBUTES, 'class']
        });
    }

    /**
     * Main audit function
     */
    async recheckAll(): Promise<void> {
        this.injectCSS();

        const widgets: NodeListOf<Element> = this.getAllWidgets();
        if (!widgets.length) return;

        widgets.forEach(widget => this.clearWidgetUI(widget));

        let attempts: number = 0;
        let success: boolean = false;
        
        while (attempts <= this.config.maxRetries! && !success) {
            try {
                // Build axe options based on configuration
                const axeOptions: AxeRunOptions = {};
                
                // Determine what rules/tags to run
                if (this.config.axeRules && this.config.axeRules.length > 0) {
                    // Run specific rules only
                    axeOptions.runOnly = { type: 'rule', values: this.config.axeRules };
                } else if (this.config.axeTags && this.config.axeTags.length > 0) {
                    // Run specific tags only
                    axeOptions.runOnly = { type: 'tag', values: this.config.axeTags };
                }
                // If neither axeRules nor axeTags are specified, run ALL rules (no runOnly restriction)
                
                const { violations }: AxeResults = await axe.run(document, axeOptions);
                
                if (this.config.enableDebugLogging) {
                    const summary: ViolationSummary[] = violations.map(v => ({ 
                        id: v.id, 
                        nodes: v.nodes.length,
                        description: v.description 
                    }));
                    const ruleInfo = this.config.axeRules?.length ? `${this.config.axeRules.length} specific rules` :
                                   this.config.axeTags?.length ? `tags: ${this.config.axeTags.join(', ')}` :
                                   'ALL available rules';
                    console.log(`[AccessibilityValidator] Checked ${ruleInfo}, violations found:`, summary);
                }
                
                widgets.forEach((widget: Element): void => {
                    const widgetViolations: AxeViolation[] = violations.filter((violation: AxeViolation): boolean => {
                        return violation.nodes.some((node: AxeNode): boolean => {
                            const element: Element | null = node.target ? document.querySelector(node.target.join(' ')) : null;
                            return element !== null && widget.contains(element);
                        });
                    });
                    
                    this.renderWidgetUI(widget, widgetViolations);
                });
                
                success = true;
            } catch (err) {
                attempts++;
                if (attempts > this.config.maxRetries!) {
                    if (this.config.enableDebugLogging) {
                        console.warn('[AccessibilityValidator] axe failed after retries', err);
                    }
                    widgets.forEach((widget: Element): void => this.renderWidgetUI(widget, []));
                } else {
                    await new Promise<void>(resolve => setTimeout(resolve, 50));
                }
            }
        }
    }

    /**
     * Public API implementation
     */
    debounceRecheck(delay?: number): void {
        if (this.recheckTimeout !== undefined) {
            clearTimeout(this.recheckTimeout);
        }
        this.recheckTimeout = setTimeout(() => this.recheckAll(), delay || this.config.debounceDelay!);
    }

    startWatching(): void {
        if (this.config.enableMutationObserver) {
            this.setupMutationObserver();
        }
    }

    stopWatching(): void {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
    }

    clearAll(): void {
        this.getAllWidgets().forEach(widget => this.clearWidgetUI(widget));
    }

    addSelectors(selectors: string[]): void {
        this.config.widgetSelectors.push(...selectors);
        this.recheckAll();
    }

    removeSelectors(selectors: string[]): void {
        this.config.widgetSelectors = this.config.widgetSelectors.filter(s => !selectors.includes(s));
        this.recheckAll();
    }

    updateConfig(newConfig: Partial<AccessibilityValidatorConfig>): void {
        this.config = this.mergeConfig({ ...this.config, ...newConfig });
        if (newConfig.uiClasses) {
            this.uiClasses = this.createUIClasses();
        }
        this.recheckAll();
    }

    getWidgetStates(): Array<{ element: Element; state: WidgetState }> {
        return Array.from(this.getAllWidgets()).map((w: Element) => ({
            element: w,
            state: this.getWidgetState(w)
        }));
    }

    getConfig(): AccessibilityValidatorConfig {
        return { ...this.config };
    }

    destroy(): void {
        this.stopWatching();
        if (this.recheckTimeout !== undefined) {
            clearTimeout(this.recheckTimeout);
        }
        this.clearAll();
        
        // Clean up event handlers
        document.querySelectorAll<PopupElement>(`.${this.uiClasses.POPUP}`).forEach((popup: PopupElement): void => {
            if (popup._outsideClickHandler) {
                document.removeEventListener('click', popup._outsideClickHandler);
            }
        });

        // Remove CSS if no other instances
        const styleElement = document.getElementById('wa11y-style');
        if (styleElement) {
            styleElement.remove();
        }
    }
}

// Factory function for easy instantiation
function createAccessibilityValidator(config: AccessibilityValidatorConfig): AccessibilityValidator {
    return new AccessibilityValidator(config);
}

// Expose on window for global access
if (typeof window !== 'undefined') {
    window.AccessibilityValidator = AccessibilityValidator;
}

// Legacy compatibility - create default instance for card-video
const cardVideoValidator = createAccessibilityValidator({
    widgetSelectors: ['.card-video']
});

// Legacy global API
(window as any).CardA11y = {
    recheckAll: () => cardVideoValidator.recheckAll(),
    debounceRecheck: (delay?: number) => cardVideoValidator.debounceRecheck(delay),
    startWatching: () => cardVideoValidator.startWatching(),
    stopWatching: () => cardVideoValidator.stopWatching(),
    clearAll: () => cardVideoValidator.clearAll(),
    addSelectors: (selectors: string[]) => cardVideoValidator.addSelectors(selectors),
    getWidgetStates: () => cardVideoValidator.getWidgetStates(),
    config: cardVideoValidator.getConfig()
};

// ES Module export for modern usage
export default AccessibilityValidator;
export { createAccessibilityValidator };
export type { 
    AccessibilityValidatorConfig, 
    AccessibilityValidatorAPI,
    AxeResults,
    AxeViolation 
};
