import "babel-polyfill";
import "../scss/customtitle.scss"

const
    d = document,
    w = window;

let instance = null;

/**
 * User custom title
 */
class CustomTitle {
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
        if (instance) return instance;
        instance = this;
        d.addEventListener('mouseover', instance.show);
        d.addEventListener('click', instance.closeTitle);
        w.addEventListener('resize', instance.closeTitle);
        w.addEventListener('scroll', instance.closeTitle);
        return instance;
    }

    /**
     * Show title
     * @param e
     * @return instance
     */
    show(e) {
        if (w.notShowTitle) return instance;
        let el = e.target,
            text;

        clearTimeout(instance.freeze);
        if (!el || el.tagName === "HTML") return instance;

        text = instance.getText(el);
        if (!text) return instance;

        // save cursor position
        instance.leftPosition = e.clientX;
        instance.topPosition = e.clientY;

        instance.freeze = setTimeout(() => {
            instance.el = el;
            d.addEventListener('mousemove', instance.cursorWatcher);
            instance.draw(text);
        }, instance.config.time);
        return instance;
    };

    /**
     * Hide title
     */
    hide() {
        if (instance.title) instance.title.style.display = '';
        d.removeEventListener('mousemove', instance.cursorWatcher);
        d.removeEventListener('click', instance.closeTitle);
        return instance;
    }

    /**
     * Close title
     */
    closeTitle() {
        if (instance.title) instance.title.style.display = '';
        instance.close = 1;
        delete instance.el;
        return instance;
    }

    /**
     * Get text for title
     * @param el
     * @return {string}
     */
    getText(el) {
        let text = '',
            max = instance.config.deepParents;
        while (el && !text && el.nodeName !== 'BODY' && max--) {
            if (!el.dataset) continue;
            text = el.dataset.title;
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
        instance.leftPosition = e.clientX;
        instance.topPosition = e.clientY;
        if (e.target !== instance.el) instance.hide();
        if (!instance.el && delete instance.close) instance.show(e);
    }

    /**
     * Draw title
     * @param text - title text
     */
    draw(text) {

        let title = instance.title;

        if (!title) {
            instance.title = title = d.createElement('div');
            title.id = 'custom-title';
            d.body.appendChild(title);
        }

        title.innerHTML = text;
        return instance.setPosition();
    }

    /**
     * Set position & show title
     */
    setPosition() {
        if (!instance.title || !instance.el) return me;
        clearTimeout(instance.setTimer);

        instance.setTimer = setTimeout(() => {
            if (!instance.el) return;
            let el = instance.el,
                difX, difY, b = d.body,
                elRect = el.getBoundingClientRect(), width, height, isFixed,
                windowYScroll = w.pageYOffset || d.documentElement.scrollTop,
                left = instance.leftPosition || elRect.left,
                top = windowYScroll + (instance.topPosition ? Math.round(instance.topPosition + 30) : Math.round(elRect.top + elRect.height + 20)),
                title = instance.title;

            isFixed = CustomTitle.parents(el).some(p => getComputedStyle(p).position === 'fixed');

            if (!elRect.width) return instance.hide();

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
        return instance;
    }

    /**
     * destroy
     */
    destroy() {
        w.removeEventListener('resize', instance.closeTitle);
        w.removeEventListener('scroll', instance.closeTitle);
        instance.title && instance.hide().title.remove();
        instance = null;
    }

    /**
     * Get parents nodes
     * @param el
     * @return {Array}
     */
    static parents(el) {
        const els = [];
        while (el && el.tagName !== 'BODY') {
            els.unshift(el);
            el = el.parentNode;
        }
        return els;
    };
}

export default window.CustomTitle = CustomTitle;