(function() {
  //Timer based animation
  var Fx = function(options) {
      this.opt = $.merge({
        duration: 1000,
        transition: function(x) { return x; },
        onCompute: $.empty,
        onComplete: $.empty
      }, options || {});
  };

  Fx.prototype = {
    timer:null,
    time:null,
    
    start: function(options) {
      this.opt = $.merge(this.opt, options || {});
      this.time = $.time();
      this.animating = true;
    },

    //perform a step in the animation
    step: function() {
      if (!this.animating) return;
      var currentTime = $.time(), time = this.time, opt = this.opt;
      if(currentTime < time + opt.duration) {
        var delta = opt.transition((currentTime - time) / opt.duration);
        opt.onCompute.call(this, delta);
      } else {
        this.animating = false;
        opt.onCompute.call(this, 1);
        opt.onComplete.call(this);
      }
    }
  };
  
  Fx.compute = function(from, to, delta) {
    return from + (to - from) * delta;
  };

  //Easing equations
  Fx.Transition = {
    linear: function(p){
      return p;
    }
  };

  var Trans = Fx.Transition;

  (function(){

    var makeTrans = function(transition, params){
      params = $.splat(params);
      return $.extend(transition, {
        easeIn: function(pos){
          return transition(pos, params);
        },
        easeOut: function(pos){
          return 1 - transition(1 - pos, params);
        },
        easeInOut: function(pos){
          return (pos <= 0.5)? transition(2 * pos, params) / 2 : (2 - transition(
              2 * (1 - pos), params)) / 2;
        }
      });
    };

    var transitions = {

      Pow: function(p, x){
        return Math.pow(p, x[0] || 6);
      },

      Expo: function(p){
        return Math.pow(2, 8 * (p - 1));
      },

      Circ: function(p){
        return 1 - Math.sin(Math.acos(p));
      },

      Sine: function(p){
        return 1 - Math.sin((1 - p) * Math.PI / 2);
      },

      Back: function(p, x){
        x = x[0] || 1.618;
        return Math.pow(p, 2) * ((x + 1) * p - x);
      },

      Bounce: function(p){
        var value;
        for ( var a = 0, b = 1; 1; a += b, b /= 2) {
          if (p >= (7 - 4 * a) / 11) {
            value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
            break;
          }
        }
        return value;
      },

      Elastic: function(p, x){
        return Math.pow(2, 10 * --p)
            * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
      }

    };

    for (var t in transitions) {
      Trans[t] = makeTrans(transitions[t]);
    }

    ['Quad', 'Cubic', 'Quart', 'Quint'].forEach(function(elem, i){
      Trans[elem] = makeTrans(function(p){
        return Math.pow(p, [
          i + 2
        ]);
      });
    });

  })();

  //animationTime - function branching
  var global = self || window;
  if (global) {
    var found = false;
    ['webkitAnimationTime', 'mozAnimationTime', 'animationTime',
     'webkitAnimationStartTime', 'mozAnimationStartTime', 'animationStartTime'].forEach(function(impl) {
      if (impl in global) {
        Fx.animationTime = function() {
          return global[impl];
        };
        found = true;
      }
    });
    if (!found) {
      Fx.animationTime = $.time;
    }
    //requestAnimationFrame - function branching
    found = false;
    ['webkitRequestAnimationFrame', 'mozRequestAnimationFrame', 'requestAnimationFrame'].forEach(function(impl) {
      if (impl in global) {
        Fx.requestAnimationFrame = function(callback) {
          global[impl](function() {
            callback();
          });
        };
        found = true;
      }
    });
    if (!found) {
      Fx.requestAnimationFrame = function(callback) {
        setTimeout(function() {
          callback();
        }, 1000 / 60);
      };
    }
  }
  

  PhiloGL.Fx = Fx;

})();
