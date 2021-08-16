/*// ------ only run boids code when visible ------
jQuery(window).on("resize scroll", function () {
  var scrollPosition = jQuery(window).scrollTop();
  var viewportHeight = window.innerHeight;
  var offset = jQuery("#boidsCanvas").offset();
  var elementHeight = jQuery("#boidsCanvas").height();
  if (
    offset.top - 0 > scrollPosition - elementHeight &&
    offset.top + 50 < scrollPosition + viewportHeight
  ) {
    loop();
  } else {
    noLoop();
  }
});
*/
// -------- boids code --------
// variable declarations
var flock;
var canvasColor;
var boidColor;
var commsColor;
var wdth = 720;
var hght = 405;
var sepweight = 2;
var aliweight = 1.2;
var cohweight = 1.1;
var walweight = 4;
var sekweight = 2;
var boidColor;
var canvasColor;
var lineColor;
var lineweight = 0.5;
var desiredseparation = 20.0;
var wallseparation = 40.0;
var commsrange = 50.0;
var neighbordist = 50;
var goalDist = 10;
var goalPresent = false;
var goal;
var home;
var commsarch = 0;

function getCommsArch() {
  let buttons = document.getElementsByName("commsArch");
  let selectedArch = 0;
  for (i = 0; i < buttons.length; i++) {
    if (buttons[i].checked) {
      selectedArch = parseInt(buttons[i].value);
    }
  }
  return selectedArch;
}

//setup function
function setup() {
  //setup canvas
  var canvas = createCanvas(wdth, hght);
  canvas.parent("#boidsCanvas");
  commsarch = getCommsArch();
  //setup colour scheme
  boidColor = color(7, 29, 73);
  canvasColor = color(243, 244, 246);
  lineColor = color(77, 89, 122);
  commsColor = color(51, 70, 110, 128);
  background(canvasColor);

  goal = createVector(wdth / 2, hght / 2);
  home = createVector(wdth / 2, hght / 2);

  //add a flock into the centre of the canvas
  flock = new Flock();
  for (var i = 0; i < 15; i++) {
    flock.addBoid(new Boid(width / 2, height / 2));
  }
}

//main loop
function draw() {
  //run Boids algorithm
  commsarch = getCommsArch();
  background(canvasColor);
  if (goalPresent) {
    fill(boidColor);
    noStroke();
    circle(goal.x, goal.y, 10);
  }
  if (commsarch > 0) {
    fill(commsColor);
    noStroke();
    square(wdth / 2 - 4, hght / 2 - 4, 8);
  }
  flock.run();
}

// Add a new boid into the System
function mousePressed() {
  if (mouseX > 0 && mouseX < wdth && mouseY > 0 && mouseY < hght) {
    goal.set(mouseX, mouseY);
    goalPresent = true;
    //flock.addBoid(new Boid(mouseX, mouseY));
  }
}

// Flock class
function Flock() {
  // An array for all the boids
  this.boids = []; // Initialize the array

  //method to increment flock simulation 1 step
  this.run = function () {
    for (var i = 0; i < this.boids.length; i++) {
      this.boids[i].run(this.boids); // Passing the entire list of boids to each boid individually
    }
    stroke(commsColor);
    strokeWeight(lineweight);
    switch (commsarch) {
      case 0:
        break;
      case 1:
        for (var i = 0; i < this.boids.length; i++) {
          line(
            this.boids[i].position.x,
            this.boids[i].position.y,
            home.x,
            home.y
          );
        }
        break;
      case 2:
        // For every boid in the system, check if it's in range
        var dhomemin = max(wdth, hght);
        var ihomemin = 0;
        for (var i = 0; i < this.boids.length - 1; i++) {
          var dhome = this.boids[i].position.dist(home);
          if (dhome < dhomemin) {
            dhomemin = dhome;
            ihomemin = i;
          }
          for (var j = i + 1; j < this.boids.length; j++) {
            let d = this.boids[i].position.dist(this.boids[j].position);
            // If the distance is greater than 0 and less than range (0 when you are yourself)
            if (d > 0 && d < commsrange) {
              // draw comms line
              line(
                this.boids[i].position.x,
                this.boids[i].position.y,
                this.boids[j].position.x,
                this.boids[j].position.y
              );
            }
          }
        }
        line(
          this.boids[ihomemin].position.x,
          this.boids[ihomemin].position.y,
          home.x,
          home.y
        );

        break;
      case 3:
        line(
          this.boids[0].position.x,
          this.boids[0].position.y,
          home.x,
          home.y
        );
        for (var i = 1; i < this.boids.length; i++) {
          line(
            this.boids[i].position.x,
            this.boids[i].position.y,
            this.boids[0].position.x,
            this.boids[0].position.y
          );
        }
        break;
    }
    for (var i = 0; i < this.boids.length; i++) {
      this.boids[i].render(); // Passing the entire list of boids to each boid individually
    }
  };
  this.addBoid = function (b) {
    this.boids.push(b);
  };
}

// Boid class
function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 2.0;
  this.maxspeed = 2; // Maximum speed
  this.maxforce = 0.03; // Maximum steering force
  this.mass = 0.01;

  //method to update forces and acceleration on boid
  this.run = function (boids) {
    this.flock(boids);
    this.update();
    this.borders();
    //this.render();
  };

  //method to apply force on boid
  this.applyForce = function (force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  };

  //method to update forces and acceleration on boid
  this.flock = function (boids) {
    var sep = this.separate(boids); // Separation
    var ali = this.align(boids); // Alignment
    var coh = this.cohesion(boids); // Cohesion
    var wal = this.walls(boids);

    // Weight these forces
    sep.mult(sepweight);
    ali.mult(aliweight);
    coh.mult(cohweight);
    wal.mult(walweight);

    // Add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
    this.applyForce(wal);
    if (goalPresent) {
      var sek = this.seek(goal);
      sek.mult(sekweight);
      this.applyForce(sek);
    }
  };

  // method to update location
  this.update = function () {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelertion to 0 each cycle
    this.acceleration.mult(0);
  };

  // method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  this.seek = function (target) {
    var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
  };

  this.seekGoal = function (target) {
    var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
  };

  // render boid
  this.render = function () {
    // Draw a triangle rotated in the direction of velocity
    var theta = this.velocity.heading() + radians(90);
    fill(canvasColor);
    stroke(boidColor);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
  };

  // Wraparound
  this.borders = function () {
    if (this.position.x < -this.r) this.position.x = width + this.r;
    if (this.position.y < -this.r) this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
  };

  // Separation
  // Method checks for nearby boids and steers away
  this.separate = function (boids) {
    var steer = createVector(0, 0);
    var count = 0;
    // For every boid in the system, check if it's too close
    for (var i = 0; i < boids.length; i++) {
      var d = p5.Vector.dist(this.position, boids[i].position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if (d > 0 && d < desiredseparation) {
        // Calculate vector pointing away from neighbor
        var diff = p5.Vector.sub(this.position, boids[i].position);
        diff.normalize();
        diff.div(d); // Weight by distance
        steer.add(diff);
        count++; // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  };

  this.walls = function (boids) {
    var steer = createVector(0, 0);
    var coeff = 0;
    var repulse = createVector(0, 0);
    var count = 0;
    // For every boid in the system, check if it's too close
    if (this.position.x < wallseparation) {
      repulse.set(1, 0);
      repulse.mult(1 / (this.position.x + 1));
      steer.add(repulse);
      count++;
    }
    if (this.position.y < wallseparation) {
      repulse.set(0, 1);
      coeff = 1 / (this.position.y + 1);
      steer.add(repulse);
      count++;
    }
    if (this.position.x > wdth - wallseparation) {
      repulse.set(-1, 0);
      coeff = 1 / (wdth - this.position.x + 1);
      steer.add(repulse);
      count++;
    }
    if (this.position.y > hght - wallseparation) {
      repulse.set(0, -1);
      coeff = 1 / (hght - this.position.y + 1);
      steer.add(repulse);
      count++;
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  };

  // Alignment function
  // For every nearby boid in the system, calculate the average velocity
  this.align = function (boids) {
    var sum = createVector(0, 0);
    var count = 0;
    for (var i = 0; i < boids.length; i++) {
      var d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighbordist) {
        sum.add(boids[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      var steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  };

  // Cohesion function
  // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
  this.cohesion = function (boids) {
    var sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    var count = 0;
    for (var i = 0; i < boids.length; i++) {
      var d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighbordist) {
        sum.add(boids[i].position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum); // Steer towards the location
    } else {
      return createVector(0, 0);
    }
  };
}