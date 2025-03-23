class MVVM {
    constructor( options ) {
        const { data, el } = options
        this.$el = BasicUtils.isElementNode(el) ? el : document.querySelector(el)
        this.$data = new Observable().observe(data)
        window.a = this.$data
        this.complier = new Compiler(this)
    }
}

class Observable {
    /**
     * description: 產生目標的代理，若目標為物件類型，則代理目標使其可觀察 (Object.defineProperty)，若不是則不經代理原樣返回目標值
     * param: target: 觀察的目標
     * return: 目標的代理，類型為物件(可觀察)，或是原始類型
     */
    observe(target) {
        if (typeof target !== 'object')  {
            return target
        }
        const observable = {}
        for (const key in target) {
            const observers = new Observers()
            let child = null
            Object.defineProperty(observable, key, {
                enumerable: true,
                get: () => {
                    observers.track(!child)
                    if (!child) {
                        child = this.observe(target[key])
                    }
                    return child
                },
                set: (newValue) => {
                    if (newValue === child) { // 兩者相等代表皆為原始類型
                        return
                    }
                    // 由新的設定值產生新的代理值，若設定值為物件類型則產生可觀察的代理值並重新追蹤觀察者
                    target[key] = newValue
                    observers.notify(typeof newValue === 'object') // 通知所有觀察者更新（並告知蹤觀察者是否需要被重新追蹤）
                    child = null // 使舊的代理值失效，以便產生新的代理值
                }
            })
        }
        return observable
    }
}

class Observers {
    constructor() {
        this.observers = []
    }
    track(flag) {
        if (Observers.activeObserver && flag)
            this.observers.push(Observers.activeObserver)
    }
    notify(active) {
        this.observers.forEach( observer => observer.update(active) )
    }
}

class Observer {
    constructor(getter, cb) {
        this.cb = cb
        this.getter = getter
        this.oldValue = this.activeWithGetter()
    }
    activeWithGetter() {
        Observers.activeObserver = this
        const val = this.getter()
        Observers.activeObserver = null
        return val
    }
    update(active) {
        const newValue = active ? this.activeWithGetter() : this.getter()
        if (this.oldValue !== newValue) {
            this.cb(newValue)
        }
        this.oldValue = newValue
    }
}

const CompilerUtils = {
    model(target, value, expr, vm) {
        target.addEventListener('input', (event) => {
            BasicUtils.setVal(vm.$data, expr, event.target.value)
        })
        target.value = value
    },
    text(target, value) {
        console.log(value)
        target.textContent = JSON.stringify({...value})
    },
    interpolate(target, value) {
        target.textContent = value
    }
}

const BasicUtils = {
    isElementNode(node) {
        return node && node.nodeType === 1
    },
    isDirective(key) {
        if (key && key.startsWith('v-')) return key.split('-')[1]
        return false
    },
    getVal(data, expr) {
        return expr.split('.').reduce((result, subExpr) => {
            return result[subExpr]
        }, data)
    },
    setVal(data, expr, value) {
        return expr.split('.').reduce((result, subExpr, index, arr) => {
            if (index === arr.length - 1) {
                result[subExpr] = value
            }
            return result[subExpr]
        }, data)
    },
    node2fragment(node) {
        const fragment = document.createDocumentFragment();
        [ ...node.childNodes ].forEach( child => {
            fragment.append(child)
        });
        return fragment
    }
}

class Compiler {
    constructor (vm) {
        this.vm = vm
        const fragment = BasicUtils.node2fragment(vm.$el)
        this.compile(fragment)
        this.vm.$el.append(fragment)
    }
    compile(node) {
        [...node.childNodes].forEach( child => {
            if (BasicUtils.isElementNode(child)) {
                this.compileElement(child)
                this.compile(child)
            } else {
                this.compileText(child)
            }
        })
    }
    compileElement(elementNode) {
        const attributes = elementNode.attributes;
        [...attributes].forEach( ({name: attrName, value: attrVal}) => {
            let directive = null
            if (directive = BasicUtils.isDirective(attrName)) {
                new Observer(() => {
                    return BasicUtils.getVal(this.vm.$data, attrVal)
                }, (newValue) => {
                    CompilerUtils[directive](elementNode, newValue, attrVal, this.vm)
                })
                const value = BasicUtils.getVal(this.vm.$data, attrVal)
                CompilerUtils[directive](elementNode, value, attrVal, this.vm)
            }
        })
    }
    compileText(textNode) {
        // 模板內容
        const templateText = textNode.textContent
        // 找查並替換模板字串函數：找查模板中的表達式字串並替換為指定的內容
        const templateReplace = (templateText, replacer) => {
            return templateText.replace(/\{\{(.+?)\}\}/g, replacer)
        }
        // 映射函數：將模板中的匹配的表達式字串映射為表達式值
        const templateExpressionMatcher = (...args) => BasicUtils.getVal(this.vm.$data, args[1])

        // 映射模板表達式字串同時創建觀察相應表達式值的觀察者
        const matcherWithObserver = (...args) => {
            new Observer(() => {
                return BasicUtils.getVal(this.vm.$data, args[1])
            }, () => {
                const newText = templateReplace(templateText, templateExpressionMatcher)
                CompilerUtils['interpolate'](textNode, newText)
            })

            return templateExpressionMatcher(...args)
        }

        const newText = templateReplace(templateText, matcherWithObserver)
        CompilerUtils['interpolate'](textNode, newText)
    }
}