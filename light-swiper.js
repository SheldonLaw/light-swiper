/*
 * Created by code_for_fun 2016/08/10
 * A mini swiper for mobile device
 * conf: {
 *  target: 'selector'
 *  interval: 5000
 * }
 */
var Swiper = function (conf) {
  this.init(conf);
};

var cur_index = 1;
var timer = null;

Swiper.prototype.init = function (conf) {
  var defaults = {
    interval: 5000
  };
  if (conf.interval) {
    defaults.interval = conf.interval;
  }
  var container = document.querySelector(conf.target + " .swiper-wrapper");
  var indicators = document.querySelectorAll(conf.target + " .swiper-pagination .bullet");
  var sliders = container.children;
  var sliders_length = sliders.length;

  //视图初始化
  cur_index = 1;
  var first_clone = sliders[0].cloneNode(true);
  var last_clone = sliders[sliders_length-1].cloneNode(true);
  container.insertBefore(last_clone, container.firstElementChild);
  container.appendChild(first_clone);
  container.style.width = (sliders_length + 2) * 100 + "%";
  container.style.transform = getPosition(cur_index, sliders_length);
  indicators[0].className = "bullet bullet-active";
  //开始轮播
  timer = setInterval(function() {
    cur_index = getIndex(cur_index, sliders_length);
    transition(container, indicators, cur_index, sliders_length);
  }, defaults.interval);
  //添加滑动响应
  var getX = /translate3d\((-?[\d.]+)%/;
  var x = 0;
  var left = 0, right = -100 / (sliders_length+2) * (sliders_length+1);
  var touchstart = 0, touchend = 0;
  container.addEventListener('touchstart', function(event) {
    if (event.targetTouches.length == 1) {    //单点触碰有效
      //暂停轮播
      clearInterval(timer);
      var touch = event.targetTouches[0];
      touchstart = touch.pageX;
      x = parseFloat(getX.exec(container.style.transform)[1]);
    }
  });
  container.addEventListener('touchend', function(event) {
    if (touchend === 0) return; //避免单击跳转
    var offset = touchend - touchstart;
    touchend = 0;
    if (Math.abs(offset) < 45) {
      //间距太小，归位
      transition(container, indicators, cur_index, sliders_length);
    } else {
      var leftToRight = offset > 0 ? false : true;
      cur_index = getIndex(cur_index, sliders_length, leftToRight);
      transition(container, indicators, cur_index, sliders_length);
    }
    //开始轮播
    timer = setInterval(function() {
      cur_index = getIndex(cur_index, sliders_length);
      transition(container, indicators, cur_index, sliders_length);
    }, defaults.interval);
  });
  container.addEventListener('touchmove', function(event) {
    if (event.targetTouches.length == 1) {
      event.preventDefault();
      var touch = event.targetTouches[0];
      touchend = touch.pageX;
      var offset = (touchend - touchstart) / window.innerWidth / (sliders_length + 2) * 100;
      var cur_x = x + offset;
      //设置滑动边界
      if (cur_x < right) {
        cur_x = right;
      } else if (cur_x > left) {
        cur_x = left;
      }
      container.style.transform = "translate3d(" + cur_x + "%,0,0)";
    }
  });
};

Swiper.prototype.stop = function () {
  clearInterval(timer);
};

//进行动画处理
function transition(container, indicators, index, count) {
  //处理图片
  container.style['transition-duration'] = "0.3s";
  container.style.transform = getPosition(index, count);
  //----------------如果是边界条件迅速切换(不播放动画)---------------------
  if (index == count + 1) {
    setTimeout(  function() {
      container.style['transition-duration'] = "0s";
      container.style.transform = getPosition(1, count);
      cur_index = 1;
    }, 300 );
  } else if (index === 0) {
    setTimeout(  function() {
      container.style['transition-duration'] = "0s";
      container.style.transform = getPosition(count, count);
      cur_index = count;
    }, 300 );
  }
  //------------------------------------------------------------------
  //处理指示点
  var indicator_index = (index + count - 1) % count;
  for(var i=0; i<indicators.length; i++) {
    var x = indicators[i];
    x.className = indicator_index == i ? "bullet bullet-active" : "bullet";
  }
  /* Safari：dom节点数组没有forEach这个方法
  indicators.forEach( function(x,i) {
    x.className = indicator_index == i ? "bullet bullet-active" : "bullet";
  } );
  */
}

//获取容器的位置
function getPosition(index, count) {
  return "translate3d(-" + index* 100/(count + 2) + "%,0,0)";
}

//获取下一个内容下标
function getIndex(last_index, count, leftToRight) {
  if (typeof leftToRight == 'undefined') {
    leftToRight = true;
  }
  if (leftToRight) {
    //1,2,3,4 -> 2  下一张
    if (last_index == count + 1) {
      return 2;
    } else {
      return last_index + 1;
    }
  } else {
    //1,0 -> 2,1  上一张
    if (last_index === 0) {
      return count - 1;
    } else {
      return last_index - 1;
    }
  }
}

window.Swiper = Swiper;
