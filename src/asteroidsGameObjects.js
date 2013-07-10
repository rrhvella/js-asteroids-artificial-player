/*
 Copyright (c) 2013, robert.r.h.vella@gmail.com
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 The views and conclusions contained in the software and documentation are those
 of the authors and should not be interpreted as representing official policies,
 either expressed or implied, of the FreeBSD Project.
 */


(function (asteroids) {
    "use strict";

    asteroids.AsteroidsGameObject = function (args) {
        var self = this;

        self.game = args.game;

        self.position = args.position ? args.position.clone() : new SAT.Vector(0, 0);

        self.rotation = args.rotation || 0;

        self.scale = args.scale;

        self.image = new Image();
        self.image.src = args.imageSrc;

        self.velocity = args.velocity ? args.velocity.clone() : new SAT.Vector(0, 0);

        self.bodies = [ new asteroids.AsteroidsGameObjectBody({ parent: self }) ];
    };

    asteroids.AsteroidsGameObject.prototype.draw = function () {
        var self = this;

        self.drawAtPositon(self.position);

        var x = self.position.x;
        var y = self.position.y;

        var viewWidth = self.game.getWidth();
        var viewHeight = self.game.getHeight();

        var radius = self.getEnclosingCircleRadius();

        var xReflectionDirection = 0;
        var yReflectionDirection = 0;

        if (x - radius < 0) {
            xReflectionDirection = 1;
        } else if (x + radius >= viewWidth) {
            xReflectionDirection = -1;
        }

        if (y - radius < 0) {
            yReflectionDirection = 1;
        } else if (y + radius >= viewHeight) {
            yReflectionDirection = -1;
        }

        if (yReflectionDirection !== 0) {
            self.drawAtPositon(new SAT.Vector(x, y + viewHeight * yReflectionDirection));
        }

        if (xReflectionDirection !== 0) {
            self.drawAtPositon(new SAT.Vector(x + viewWidth * xReflectionDirection, y));
        }

        var hasDiagonalReflection = yReflectionDirection !== 0 && xReflectionDirection !== 0;

        if (hasDiagonalReflection) {
            var diagonalReflectionPositon = new SAT.Vector(
                x + viewWidth * xReflectionDirection,
                y + viewHeight * yReflectionDirection
            );

            self.drawAtPositon(diagonalReflectionPositon);
        }
    };

    asteroids.AsteroidsGameObject.prototype.drawAtPositon = function (position) {
        var self = this;

        var drawingContext = self.game.getDrawingContext();

        drawingContext.translate(position.x, position.y);
        drawingContext.rotate(self.rotation);
        drawingContext.scale(self.scale, self.scale);

        drawingContext.translate(-0.5, -0.5);

        drawingContext.drawImage(self.image, 0, 0, 1, 1);

        twoDContextHelperFunctions.resetTransform(drawingContext);
    };

    asteroids.AsteroidsGameObject.prototype.update = function () {
        var self = this;

        var x = self.position.x;
        var y = self.position.y;

        var viewWidth = self.game.getWidth();
        var viewHeight = self.game.getHeight();

        var radius = self.getEnclosingCircleRadius();

        if (x - radius > viewWidth) {
            x = x - viewWidth;
        } else if (x + radius <= 0) {
            x = x + viewWidth;
        }

        if (y - radius > viewHeight) {
            y = y - viewHeight;
        } else if (y + radius <= 0) {
            y = y + viewHeight;
        }

        self.position.x = x;
        self.position.y = y;

        self.position.add(self.velocity);
    };

    asteroids.AsteroidsGameObject.prototype.kill = function () {
        var self = this;

        self.game.gameObjects = _.without(self.game.gameObjects, self);
    };

    asteroids.AsteroidsGameObject.prototype.getEnclosingCircleRadius = function () {
        var self = this;

        return self.scale / 2;
    };

    asteroids.AsteroidsGameObject.prototype.collidedWith = function (gameObject) {
    };

    asteroids.AsteroidsGameObjectBody = function (args) {
        var self = this;

        self.parent = args.parent;
        self.offsetFromParent = args.offsetFromParent ? args.offsetFromParent.clone() : new SAT.Vector(0, 0);
    };

    asteroids.AsteroidsGameObjectBody.prototype.getCircleCollider = function () {
        var self = this;

        return new SAT.Circle(self.getOffsetPosition(), self.parent.getEnclosingCircleRadius());
    };

    asteroids.AsteroidsGameObjectBody.prototype.getOffsetPosition = function () {
        var self = this;

        return self.parent.position.clone().add(self.offsetFromParent);
    };

    asteroids.Ship = function (args) {
        var self = this;

        self._timeLeftToShoot = 0;

        asteroids.AsteroidsGameObject.call(
            self,
            {
                game: args.game,

                position: args.position,
                scale: 32,

                imageSrc: "media/ship.png"

            }
        );
    };

    asteroids.Ship.prototype.ANGULAR_VELOCITY = Math.PI * 0.012;
    asteroids.Ship.prototype.MAXIMUM_VELOCITY_MAGNITUDE = 4;

    var brakingForceMagnitude = 0.1;
    asteroids.Ship.prototype.BRAKING_FORCE_MAGNITUDE = brakingForceMagnitude;

    var accelerationMagnitude = 0.3;
    asteroids.Ship.prototype.ACCELERATION_MAGNITUDE = accelerationMagnitude;

    asteroids.Ship.prototype.ACTUAL_ACCELERATION_MAGNITUDE = accelerationMagnitude - brakingForceMagnitude;

    _.extend(asteroids.Ship.prototype, asteroids.AsteroidsGameObject.prototype);
    asteroids.Ship.prototype.constructor = asteroids.Ship;

    asteroids.Ship.prototype.getHeading = function () {
        var self = this;

        self.rotation = mathHelperFunctions.normalizeAngle(self.rotation);

        var result = SAT.angleToNormal(self.rotation);
        result.normalize();

        return result;
    };

    asteroids.Ship.prototype.collidedWith = function (gameObject) {
        var self = this;

        if (gameObject.OBJECT_TYPE === asteroids.Asteroid.prototype.OBJECT_TYPE) {
            self.game.gameOver({won: false});
        }
    };

    asteroids.Ship.prototype.accelerate = function () {
        var self = this;

        self.velocity.add(self.getHeading().scale(self.ACCELERATION_MAGNITUDE));
        self.velocity.clamp(self.MAXIMUM_VELOCITY_MAGNITUDE);
    };

    asteroids.Ship.prototype.turn = function (direction) {
        var self = this;

        self.rotation += self.ANGULAR_VELOCITY * direction;
        self.rotation = mathHelperFunctions.normalizeAngle(self.rotation);
    };

    asteroids.Ship.prototype.update = function () {
        var self = this;

        self.brake();

        if (self._timeLeftToShoot > 0) {
            self._timeLeftToShoot -= 1;
        }

        asteroids.AsteroidsGameObject.prototype.update.call(self);
    };

    asteroids.Ship.prototype.brake = function () {
        var self = this;

        var velocityMagnitudeSquared = self.velocity.len2();
        if (velocityMagnitudeSquared > 0) {
            var velocityMagnitude = Math.sqrt(velocityMagnitudeSquared);
            var newVelocityMagnitude = velocityMagnitude - self.BRAKING_FORCE_MAGNITUDE;

            if (newVelocityMagnitude < 0) {
                self.velocity.scale(0);
            } else {
                self.velocity.normalize().scale(newVelocityMagnitude);
            }
        }
    };

    asteroids.Ship.prototype.fire = function () {
        var self = this;

        if (self._timeLeftToShoot !== 0) {
            return;
        }

        self.game.gameObjects.push(
            new asteroids.Projectile({
                game: self.game,

                position: self.position.clone(),
                direction: self.getHeading()
            })
        );

        self._timeLeftToShoot = 30;
    };

    asteroids.Projectile = function (args) {
        var self = this;

        var velocity = args.direction.scale(self.VELOCITY_MAGNITUDE);

        asteroids.AsteroidsGameObject.call(self, {
            game: args.game,
            scale: 5,
            velocity: velocity,
            position: args.position.add(velocity),
            imageSrc: "media/asteroid.png"
        });

        self.timeToDeath = self.NUMBER_OF_FRAMES_TO_DEATH;
    };

    asteroids.Projectile.prototype.VELOCITY_MAGNITUDE = 5;
    asteroids.Projectile.prototype.NUMBER_OF_FRAMES_TO_DEATH = 60;

    asteroids.Projectile.prototype.MAX_DISTANCE = asteroids.Projectile.prototype.VELOCITY_MAGNITUDE *
        asteroids.Projectile.prototype.NUMBER_OF_FRAMES_TO_DEATH;

    _.extend(asteroids.Projectile.prototype, asteroids.AsteroidsGameObject.prototype);
    asteroids.Projectile.prototype.constructor = asteroids.Projectile;

    asteroids.Projectile.prototype.update = function () {
        var self = this;

        self.timeToDeath -= 1;

        if (self.timeToDeath === 0) {
            self.kill();
        }

        asteroids.AsteroidsGameObject.prototype.update.call(self);
    };

    asteroids.Asteroid = function (args) {
        var self = this;

        var maxAsteroidVelocityMagnitude = 2;
        var minAsteroidVelocityMagnitude = 0.5;

        var velocityRange = (maxAsteroidVelocityMagnitude - minAsteroidVelocityMagnitude);
        var asteroidVelocityMagnitude = minAsteroidVelocityMagnitude + Math.random() * velocityRange;

        asteroids.AsteroidsGameObject.call(
            self,
            {
                game: args.game,

                position: args.position,
                velocity: SAT.randomNormal().scale(asteroidVelocityMagnitude),
                scale: args.scale || 128,

                imageSrc: "media/asteroid.png"

            }
        );

        var viewWidth = self.game.getWidth();
        var viewHeight = self.game.getHeight();
        var i;
        var j;

        for (i = -1; i <= 1; i += 1) {
            for (j = -1; j <= 1; j += 1) {
                if (i !== 0 || j !== 0) {
                    self.bodies.push(
                        new asteroids.AsteroidsGameObjectBody({
                            parent: self,
                            offsetFromParent: new SAT.Vector(viewWidth * i, viewHeight * j)
                        })
                    );
                }
            }
        }
    };

    _.extend(asteroids.Asteroid.prototype, asteroids.AsteroidsGameObject.prototype);
    asteroids.Asteroid.prototype.constructor = asteroids.Asteroid;

    asteroids.Asteroid.prototype.collidedWith = function (gameObject) {
        var self = this;

        if (gameObject.OBJECT_TYPE === asteroids.Projectile.prototype.OBJECT_TYPE) {
            self.kill();
            gameObject.kill();

            var minimumScale = 32;

            if (self.scale <= minimumScale) {
                if (self.game.getAsteroids().length === 0) {
                    self.game.gameOver({won: true});
                }
            } else {
                var asteroidArguments = {
                    game: self.game,
                    position: self.position,
                    scale: self.scale / 2
                };

                self.game.gameObjects.push(new asteroids.Asteroid(asteroidArguments));
                self.game.gameObjects.push(new asteroids.Asteroid(asteroidArguments));
            }
        }
    };

    asteroids.Ship.prototype.OBJECT_TYPE = 1;
    asteroids.Asteroid.prototype.OBJECT_TYPE = 2;
    asteroids.Projectile.prototype.OBJECT_TYPE = 3;

}(window.asteroids = window.asteroids || {}));
