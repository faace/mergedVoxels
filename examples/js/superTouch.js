(function () {
    if (typeof AFRAME == 'undefined') throw '[super touch] AFRAME should be loaded first.';

    const PI = Math.PI, subPI = -PI;
    const PI2 = Math.PI * 2, subPI2 = -PI2;
    const PI_25 = Math.PI * 0.25;
    const PI_5 = Math.PI * 0.5;

    var getRangeSchema = function (min, max, scale) {
        scale = scale || 1;
        return {
            default: { min: min, max: max },// #dd0000_floor,#dddd00_box
            parse: function (value) {
                var t = { min: min, max: max };
                if (typeof value == 'string') {
                    var list = value.trim().split(' ');
                    var l0 = parseFloat(list[0] * scale), l1 = parseFloat(list[1] * scale);
                    t.min = Math.min(l0, l1);
                    t.max = Math.max(l0, l1);
                }
                return t;
            },
            stringify: function (value) {
                return (value.min / scale) + ' ' + (value.max / scale);
            }
        };
    };

    AFRAME.registerComponent('super-touch', {

        schema: {
            touchTarget: { type: 'string' },
            rotationY: getRangeSchema(-Math.PI, Math.PI, PI / 180),
            rotationX: getRangeSchema(-Math.PI, Math.PI, PI / 180),
            rotationZ: getRangeSchema(-Math.PI, Math.PI, PI / 180),
            scale: getRangeSchema(0.01, 2, 1),
        },

        init: function () {
            this.registerEvents();
            this.scaleStep = (this.data.scale.max - this.data.scale.min) * 0.1;
        },

        registerEvents: function () {
            var touchTarget = this.touchTarget = this.data.touchTarget ? document.querySelector(this.data.touchTarget) : document;

            if (touchTarget) {
                if (this.isPC()) {
                    this.downs = [false, false, false];

                    touchTarget.addEventListener('mousedown', this.mouseDown.bind(this));
                    touchTarget.addEventListener('mousemove', this.mouseMove.bind(this));
                    touchTarget.addEventListener('mouseup', this.mouseUp.bind(this));
                    touchTarget.addEventListener('mousewheel', this.mouseWheel.bind(this));

                    document.oncontextmenu = function () { return false; }
                } else {
                    touchTarget.addEventListener('touchstart', this.touchStart.bind(this));
                    touchTarget.addEventListener('touchmove', this.touchMove.bind(this));
                    touchTarget.addEventListener('touchend', this.touchEnd.bind(this));
                    touchTarget.addEventListener('touchcancel', this.touchEnd.bind(this));
                }
            } else console.log('Error touchTarget!');
        },
        mouseDown: function (evt) { // evt.type == 'touchstart'
            this.rotation = this.el.object3D.rotation;
            // console.log(evt.buttons) // 1:left, 2:right, 3:left&right,4:middle,5:left&middle, 6:right&middle, 7:left&right&middel
            // if (this.downs[evt.buttons]) return;
            this.downs[evt.buttons] = true;
            this.clientX = evt.clientX;
            this.clientY = evt.clientY;
            evt.stopPropagation();
            evt.preventDefault();
            // console.log(evt.button, this.downs[evt.button]);
        },
        mouseMove: (function () {
            var deltaX, deltaY;
            var step = 40;

            return function (evt) {
                // console.log(evt.button, evt.buttons, this.downs);
                if (this.downs[evt.buttons]) {
                    // console.log(evt.buttons);
                    switch (evt.buttons) {
                        case 2: { // right
                            deltaX = evt.clientX - this.clientX;
                            this.clientX = evt.clientX;
                            this.rotation.y += deltaX * 0.01;
                            while (this.rotation.y < subPI) this.rotation.y += PI2;
                            while (this.rotation.y > PI) this.rotation.y += subPI2;
                            if (this.rotation.y < this.data.rotationY.min) this.rotation.y = this.data.rotationY.min;
                            else if (this.rotation.y > this.data.rotationY.max) this.rotation.y = this.data.rotationY.max;



                            if (this.rotation.y <= PI_25 && this.rotation.y >= -PI_25) { // 正中
                                deltaY = evt.clientY - this.clientY;
                                this.clientY = evt.clientY;
                                this.rotation.x += deltaY * 0.01;
                                while (this.rotation.x < subPI) this.rotation.x += PI2;
                                while (this.rotation.x > PI) this.rotation.x += subPI2;
                                if (this.rotation.x < this.data.rotationX.min) this.rotation.x = this.data.rotationX.min;
                                else if (this.rotation.x > this.data.rotationX.max) this.rotation.x = this.data.rotationX.max;

                            } else if (this.rotation.y > PI_25 && this.rotation.y < PI_5 + PI_25) { // 左边
                                deltaY = evt.clientY - this.clientY;
                                this.clientY = evt.clientY;
                                this.rotation.z += deltaY * 0.01;
                                while (this.rotation.z < subPI) this.rotation.z += PI2;
                                while (this.rotation.z > PI) this.rotation.z += subPI2;
                                if (this.rotation.z < this.data.rotationZ.min) this.rotation.z = this.data.rotationZ.min;
                                else if (this.rotation.z > this.data.rotationZ.max) this.rotation.z = this.data.rotationZ.max;
                            } else if (this.rotation.y < -PI_25 && this.rotation.y > -PI_5 - PI_25) { // 右边
                                deltaY = this.clientY - evt.clientY;
                                this.clientY = evt.clientY;
                                this.rotation.z += deltaY * 0.01;
                                while (this.rotation.z < subPI) this.rotation.z += PI2;
                                while (this.rotation.z > PI) this.rotation.z += subPI2;
                                if (this.rotation.z < this.data.rotationZ.min) this.rotation.z = this.data.rotationZ.min;
                                else if (this.rotation.z > this.data.rotationZ.max) this.rotation.z = this.data.rotationZ.max;
                            } else { // 后边
                                deltaY = this.clientY - evt.clientY;
                                this.clientY = evt.clientY;
                                this.rotation.x += deltaY * 0.01;
                                while (this.rotation.x < subPI) this.rotation.x += PI2;
                                while (this.rotation.x > PI) this.rotation.x += subPI2;
                                if (this.rotation.x < this.data.rotationX.min) this.rotation.x = this.data.rotationX.min;
                                else if (this.rotation.x > this.data.rotationX.max) this.rotation.x = this.data.rotationX.max;
                            }
                            break;
                        }
                    }
                }
                evt.stopPropagation();
                evt.preventDefault();
            }
        })(),
        mouseUp: function (evt) {
            this.downs[evt.button] = false;
            evt.stopPropagation();
            evt.preventDefault();
        },
        mouseWheel: function (evt) {

            var scale = this.el.object3D.scale;
            if (evt.wheelDelta > 0) { // 向上滚，变大
                scale.x += this.scaleStep;
                if (scale.x > this.data.scale.max) scale.x = this.data.scale.max;
            } else {
                scale.x -= this.scaleStep;
                if (scale.x < this.data.scale.min) scale.x = this.data.scale.min;
            }
            // console.log(this.data.scale, scale.x);
            scale.y = scale.z = scale.x;
        },
        touchStart: function (evt) { // evt.type == 'touchstart'
            if (this.isDown) return;
            this.isDown = true;
            var touches = evt.touches;
            this.clientX = touches[0].clientX;
            this.clientY = touches[0].clientY;

            if (touches.length > 1) {
                this.distance = (touches[0].clientX - touches[1].clientX) * (touches[0].clientX - touches[1].clientX)
                    + (touches[0].clientY - touches[1].clientY) * (touches[0].clientY - touches[1].clientY);
            } else this.distance = false;
        },
        touchMove: function (evt) {
            if (this.isDown) {
                var touches = evt.touches;

                if (touches.length > 1) {
                    // 只记录
                    this.clientX = touches[0].clientX;
                    this.clientY = touches[0].clientY;

                    var distance = (touches[0].clientX - touches[1].clientX) * (touches[0].clientX - touches[1].clientX)
                        + (touches[0].clientY - touches[1].clientY) * (touches[0].clientY - touches[1].clientY);
                    if (!this.distance) this.distance = distance;
                    else {
                        var gap = 0.001 * (distance > this.distance ? 1 : -1)
                        var scale = this.el.object3D.scale.z + gap * Math.sqrt(Math.abs(distance - this.distance));
                        if (scale < 0.3) scale = 0.3;
                        else if (scale > 3) scale = 3;
                        this.el.object3D.scale.x = this.el.object3D.scale.y = this.el.object3D.scale.z = scale;
                        this.distance = distance;
                    }
                } else {
                    var deltaX = touches[0].clientX - this.clientX;
                    this.clientX += deltaX;
                    var deltaY = touches[0].clientY - this.clientY;
                    this.clientY += deltaY;
                    this.el.object3D.rotation.y += deltaX * 0.01;
                    this.el.object3D.rotation.x += deltaY * 0.01;

                    this.distance = false;
                }
            }
        },
        touchEnd: function (evt) {
            this.isDown = false;
        },

        remove: function () {
            var touchTarget = this.touchTarget;
            if (touchTarget) {
                if (this.isPC()) {
                    touchTarget.removeEventListener('mousedown', this.mouseDown.bind(this));
                    touchTarget.removeEventListener('mousemove', this.mouseMove.bind(this));
                    touchTarget.removeEventListener('mouseup', this.mouseUp.bind(this));
                } else {
                    touchTarget.removeEventListener('touchstart', this.touchStart.bind(this));
                    touchTarget.removeEventListener('touchmove', this.touchMove.bind(this));
                    touchTarget.removeEventListener('touchend', this.touchEnd.bind(this));
                    touchTarget.removeEventListener('touchcancel', this.touchEnd.bind(this));
                }
            }
        },

        isPC: function () {
            var userAgentInfo = navigator.userAgent;
            var Agents = ['Android', 'iPhone', 'iPad', 'iPod', 'SymbianOS', 'Windows Phone'];
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) return false;
            }
            return true;
        },


        // tick: function (time, timeDelta) {
        //     // Do something on every scene tick or frame.
        // }
    });

})();
