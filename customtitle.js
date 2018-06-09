const
    d = document,
    w = window;

/**
 * User custom title
 */
export class CustomTitle {
    constructor(opts = {}) {

        this.config = Object.assign({
            time: 500, // show title after time (ms)
            deepParents: 3 // how deep find parents for show title
        }, opts);

        this.ini();
    }

    /**
     * Initialization
     */
    ini() {
        d.addEventListener('mouseover', this.show.bind(this));
        d.addEventListener('click', this.closeTitle.bind(this));
        w.addEventListener('resize', this.hide.bind(this));
        w.addEventListener('scroll', this.hide.bind(this));
        return this;
    }

    /**
     * Show title
     * @param e
     */
    show(e) {
        if (w.notShowTitle) return this;
        let me = this,
            el = e.target,
            text;

        clearTimeout(this.freeze);
        if (!el || el.tagName === "HTML") return this;

        text = this.getText(el);
        if (!text) return this;

        // save cursor position
        me.leftPosition = e.clientX;
        me.topPosition = e.clientY;

        me.freeze = setTimeout(() => {
            me.el = el;
            d.addEventListener('mousemove', me.cursorWatcher.bind(me));
            me.draw(text);
        }, this.config.time);
        return this;
    };

    /**
     * Hide title
     */
    hide() {
        if (this.title) this.title.style.display = '';
        d.removeEventListener('mousemove', this.cursorWatcher);
        d.removeEventListener('click', this.closeTitle);
        w.removeEventListener('resize', this.hide);
        w.removeEventListener('scroll', this.hide);
        return this;
    }

    /**
     * Update title
     */
    closeTitle() {
        if (this.title) this.title.style.display = '';
        this.close = 1;
        delete this.el;
        return this;
    }

    /**
     * Get text for title
     * @param el
     * @return {string}
     */
    getText(el) {
        let text = '',
            max = this.config.deepParents;
        while (el && !text && el.nodeName !== 'BODY' && max--) {
            if (!el.dataset) continue;
            text = el.dataset.title || el.dataset.guide;
            el = el.parentElement;
        }
        return text;
    }

    /**
     * Tracking cursor position
     * @param e
     */
    cursorWatcher(e) {
        // update cursor position
        this.leftPosition = e.clientX;
        this.topPosition = e.clientY;
        if (e.target !== this.el) this.hide();
        if (!this.el && delete this.close) this.show(e);
    }

    /**
     * Draw title
     * @param text - title text
     */
    draw(text) {

        let title = this.title;

        if (!title) {
            this.title = title = d.createElement('div');
            title.id = 'custom-title';
            d.body.appendChild(title);
        }

        title.innerHTML = text;
        return this.setPosition();
    }

    /**
     * Set position & show title
     */
    setPosition() {
        let me = this;
        if (!me.title || !me.el) return me;
        clearTimeout(me.setTimer);

        me.setTimer = setTimeout(() => {
            if (!me.el) return;
            let el = me.el,
                difX, difY, b = d.body,
                elRect = el.getBoundingClientRect(), width, height, isFixed,
                windowYScroll = w.pageYOffset || d.documentElement.scrollTop,
                left = me.leftPosition || elRect.left,
                top = windowYScroll + (me.topPosition ? Math.round(me.topPosition + 25) : Math.round(elRect.top + elRect.height + 15)),
                title = me.title;

            isFixed = me.parents(el).some(p => getComputedStyle(p).position === 'fixed');

            if (!elRect.width) return me.hide();

            title.style.display = 'block';
            title.style.left = left + 'px';
            title.style.right = '';
            title.style.top = top + 'px';
            title.style.bottom = '';

            width = /*isFixed ? w.innerWidth : */b.clientWidth;
            height = isFixed ? w.innerHeight : b.clientHeight;

            // check on screen
            difX = width - left - title.clientWidth - 15;
            difY = height + windowYScroll - top - title.clientHeight - 15;

            if (difX < 0) {
                title.style.left = '';
                title.style.right = b.clientWidth - left + 'px';
            }

            if (difY < 0) {
                title.style.top = Math.round(top - title.offsetHeight - 30) + 'px';
            }

        }, 5);
        return me;
    }

    /**
     * Get parents nodes
     * @param el
     * @return {Array}
     */
    parents(el) {
        const els = [];
        while (el && el.tagName !== 'BODY') {
            els.unshift(el);
            el = el.parentNode;
        }
        return els;
    };
}
