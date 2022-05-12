(function (global) {
    const _flip = (ele, rectFirst, rectLast) => {

        let dx, dy, dw, dh
        let origin
        if (!rectFirst)
        {
            dx = 0
            dy = 0
            dw = 0
            dh = 0
            origin = 'center center'
        } else
        {
            dx = rectFirst.x - rectLast.x
            dy = rectFirst.y - rectLast.y
            dw = rectFirst.width / rectLast.width
            dh = rectFirst.height / rectLast.height
            origin = 'top left'
        }

        ele.animate([ {
            transformOrigin: `${origin}`,
            transform: `
                        translateX(${dx}px)
                        translateY(${dy}px)
                        scaleX(${dw})
                        scaleY(${dh})
                    `
        }, {
            transformOrigin: `${origin}`,
            transform: 'none'
        } ], {
            duration: 500,
            delay: 0,
            easing: 'ease',
        })
    }

    function isVisible(ele) {
        const rect = ele.getBoundingClientRect()
        return rect.width != 0 && rect.height != 0
    }

    function toElementMap() {
        const map = {}
        const elements = document.querySelectorAll('[data-flip-key]')
        Array.prototype
            .filter
            .call(elements, ele => isVisible(ele))
            .forEach(ele => {
                const key = ele.dataset.flipKey
                map[ key ] = ele
            })

        return map
    }

    function Flipping() {
        const flippingElements = {}

        this.wrap = (wrapped) => {
            return () => {

                const firstRects = read()
                const ret = wrapped()
                const lastRects = read()
                flip(firstRects, lastRects)
                return ret
            }
        }

        const read = () => {
            const map = toElementMap()
            const rects = {}
            Object.keys(map).map(key => {
                const element = map[ key ]
                const rect = element.getBoundingClientRect()

                rects[ key ] = rect
            })
            return rects
        }


        const flip = (firstRects, lastRects) => {
            const map = toElementMap()
            Object.keys(map).forEach((key) => {
                _flip(map[ key ], firstRects[ key ], lastRects[ key ])
            }
            )
        }
    }
    global.Flipping = Flipping
})(window)