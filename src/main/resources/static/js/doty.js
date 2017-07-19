var CONFIG = {
  circleMinRadius: 2,
  circleMaxRadius: 24,
  circleSpacing: 38,
  circleMinAlpha: .1,
  circleColor: "#2747D8",
  bgColor: "rgba(255,255,255,0.1)",
  waveSpeed: 5, // px/frame
  waveLength: 160,
};

var App = function() {
  this.canvas = document.getElementById("canvas");
  this.ctx = canvas.getContext("2d");
  this.circles = [];
  this.waves = [];
};

App.prototype.init = function() {
  var _this = this;
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  // create circles
  var x = CONFIG.circleSpacing;
  var y = CONFIG.circleSpacing;
  while((y += CONFIG.circleSpacing) + CONFIG.circleSpacing < this.canvas.height) {
    x = CONFIG.circleSpacing;
    while((x += CONFIG.circleSpacing) + CONFIG.circleSpacing < this.canvas.width) {
      this.circles.push(new Circle(this.ctx, x, y, CONFIG.circleMinRadius));
    }
  }
  // event
  this.canvas.addEventListener('click', function(event) {
    _this.startWave(event.offsetX, event.offsetY);
  });
  // first update
  this.update();
};

App.prototype.update = function() {
  var _this = this;
  this.ctx.fillStyle = CONFIG.bgColor;
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  // update circles
  var i = this.circles.length;
  while(i--) {
    this.circles[i].update(this.waves);
  }
  // update waves
  var j = this.waves.length;
  while(j--) {
    // wave is dead
    if(this.waves[j].affectedPoints == 0) {
      this.waves.splice(j, 1);
    }
    // update radius
    this.waves[j].radius += CONFIG.waveSpeed;
  }
  // next update
  requestAnimationFrame(function(){
    return _this.update();
  });
};

App.prototype.startWave = function(x, y) {
  this.waves.push({x:x, y:y, radius:0, affectedPoints: 0});
}

var Circle = function(ctx, x, y, radius) {
  this.ctx = ctx;
  this.x = x;
  this.y = y;
  this.radius = radius;
};

Circle.prototype.update = function(waves) {
  // update size
  var ratio = 0;
  var i = waves.length;
  while(i--) {
    var distanceToCenter = Math.sqrt(Math.pow(this.x - waves[i].x, 2) + Math.pow(this.y - waves[i].y, 2));
    var d = Math.abs(distanceToCenter - waves[i].radius);
    var r = Math.max(1 - d / CONFIG.waveLength, 0);
    ratio += r;
    if(r) {
      waves[i].affectedPoints++;
    }
  }
  this.radius = Math.round(Math.max(CONFIG.circleMaxRadius * ratio, CONFIG.circleMinRadius));
  // draw
  this.ctx.fillStyle = CONFIG.circleColor;
  this.ctx.globalAlpha = CONFIG.circleMinAlpha + ratio * (1 - CONFIG.circleMinAlpha);
  this.ctx.beginPath();
  this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
  this.ctx.fill();
  this.ctx.globalAlpha = 1;
};

var theApp = new App();
theApp.init();
