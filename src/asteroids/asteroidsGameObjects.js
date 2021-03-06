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


define(["mathHelperFunctions", "twoDContextHelperFunctions", "underscore", "satExtensions"], function (mathHelperFunctions, twoDContextHelperFunctions) {
    "use strict";

    var moddef = {};

    moddef.AsteroidsGameObject = function (args) {
        var self = this;

        self.game = args.game;

        self.position = args.position ? args.position.clone() : new SAT.Vector(0, 0);
        self.rotation = args.rotation || 0;
        self.scale = args.scale;

        self.velocity = args.velocity ? args.velocity.clone() : new SAT.Vector(0, 0);

        self.image = args.image;

        self.bodies = [ new moddef.AsteroidsGameObjectBody({ parent: self }) ];
    };

    moddef.AsteroidsGameObject.prototype.draw = function () {
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

    moddef.AsteroidsGameObject.prototype.drawAtPositon = function (position) {
        var self = this;

        var drawingContext = self.game.getDrawingContext();

        drawingContext.translate(position.x, position.y);
        drawingContext.rotate(self.rotation);
        drawingContext.scale(self.scale, self.scale);

        drawingContext.translate(-0.5, -0.5);

        drawingContext.drawImage(self.image, 0, 0, 1, 1);

        twoDContextHelperFunctions.resetTransform(drawingContext);
    };

    moddef.AsteroidsGameObject.prototype.update = function () {
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

    moddef.AsteroidsGameObject.prototype.kill = function () {
        var self = this;

        self.game.gameObjects = _.without(self.game.gameObjects, self);
    };

    moddef.AsteroidsGameObject.prototype.getEnclosingCircleRadius = function () {
        var self = this;

        return self.scale / 2;
    };

    moddef.AsteroidsGameObject.prototype.collidedWith = function (gameObject) {
    };

    moddef.AsteroidsGameObjectBody = function (args) {
        var self = this;

        self.parent = args.parent;
        self.offsetFromParent = args.offsetFromParent ? args.offsetFromParent.clone() : new SAT.Vector(0, 0);
    };

    moddef.AsteroidsGameObjectBody.prototype.getCircleCollider = function () {
        var self = this;

        return new SAT.Circle(self.getOffsetPosition(), self.parent.getEnclosingCircleRadius());
    };

    moddef.AsteroidsGameObjectBody.prototype.getOffsetPosition = function () {
        var self = this;

        return self.parent.position.clone().add(self.offsetFromParent);
    };

    moddef.Ship = function (args) {
        var self = this;

        self._timeLeftToShoot = 0;

        moddef.AsteroidsGameObject.call(
            self,
            {
                game: args.game,

                position: args.position,
                scale: 32,

                image: self.IMAGE
            }
        );
    };

    var brakingForceMagnitude = 0.2;
    var accelerationMagnitude = 0.6;

    moddef.Ship.prototype.ANGULAR_VELOCITY = Math.PI * 0.025;
    moddef.Ship.prototype.MAXIMUM_VELOCITY_MAGNITUDE = 8;

    moddef.Ship.prototype.BRAKING_FORCE_MAGNITUDE = brakingForceMagnitude;
    moddef.Ship.prototype.ACCELERATION_MAGNITUDE = accelerationMagnitude;
    moddef.Ship.prototype.ACTUAL_ACCELERATION_MAGNITUDE = accelerationMagnitude - brakingForceMagnitude;

    moddef.Ship.prototype.IMAGE = new Image();
    moddef.Ship.prototype.IMAGE.src = "media/ship.png";

    _.extend(moddef.Ship.prototype, moddef.AsteroidsGameObject.prototype);
    moddef.Ship.prototype.constructor = moddef.Ship;

    moddef.Ship.prototype.getHeading = function () {
        var self = this;

        self.rotation = mathHelperFunctions.normalizeAngle(self.rotation);
        return SAT.angleToNormal(self.rotation);
    };

    moddef.Ship.prototype.collidedWith = function (gameObject) {
        var self = this;

        if (gameObject.OBJECT_TYPE === moddef.Asteroid.prototype.OBJECT_TYPE) {
            self.game.gameOver({won: false});
        }
    };

    moddef.Ship.prototype.accelerate = function () {
        var self = this;

        self.velocity.add(self.getHeading().scale(self.ACCELERATION_MAGNITUDE));
        self.velocity.clamp(self.MAXIMUM_VELOCITY_MAGNITUDE);
    };

    moddef.Ship.prototype.turn = function (direction) {
        var self = this;

        self.rotation += self.ANGULAR_VELOCITY * direction;
        self.rotation = mathHelperFunctions.normalizeAngle(self.rotation);
    };

    moddef.Ship.prototype.update = function () {
        var self = this;

        self.brake();

        if (self._timeLeftToShoot > 0) {
            self._timeLeftToShoot -= 1;
        }

        moddef.AsteroidsGameObject.prototype.update.call(self);
    };

    moddef.Ship.prototype.brake = function () {
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

    moddef.Ship.prototype.fire = function () {
        var self = this;

        if (self._timeLeftToShoot !== 0) {
            return;
        }

        self.game.gameObjects.push(
            new moddef.Projectile({
                game: self.game,

                position: self.position.clone(),
                direction: self.getHeading()
            })
        );

        self._timeLeftToShoot = 15;
    };

    moddef.Projectile = function (args) {
        var self = this;

        var velocity = args.direction.scale(self.VELOCITY_MAGNITUDE);

        moddef.AsteroidsGameObject.call(self, {
            game: args.game,
            scale: 5,
            velocity: velocity,
            position: args.position.add(velocity),
            image: self.IMAGE
        });

        self.timeToDeath = self.NUMBER_OF_FRAMES_TO_DEATH;
    };

    moddef.Projectile.prototype.VELOCITY_MAGNITUDE = 10;
    moddef.Projectile.prototype.NUMBER_OF_FRAMES_TO_DEATH = 30;

    moddef.Projectile.prototype.IMAGE = new Image();
    moddef.Projectile.prototype.IMAGE.src = "media/asteroid.png";

    moddef.Projectile.prototype.MAX_DISTANCE = moddef.Projectile.prototype.VELOCITY_MAGNITUDE *
        moddef.Projectile.prototype.NUMBER_OF_FRAMES_TO_DEATH;

    _.extend(moddef.Projectile.prototype, moddef.AsteroidsGameObject.prototype);
    moddef.Projectile.prototype.constructor = moddef.Projectile;

    moddef.Projectile.prototype.update = function () {
        var self = this;

        self.timeToDeath -= 1;

        if (self.timeToDeath === 0) {
            self.kill();
        }

        moddef.AsteroidsGameObject.prototype.update.call(self);
    };

    moddef.Asteroid = function (args) {
        var self = this;
        var minAsteroidVelocityMagnitude = 1;
        var maxAsteroidVelocityMagnitude = 4;

        var velocityRange = (maxAsteroidVelocityMagnitude - minAsteroidVelocityMagnitude);
        var asteroidVelocityMagnitude = minAsteroidVelocityMagnitude + Math.random() * velocityRange;

        moddef.AsteroidsGameObject.call(
            self,
            {
                game: args.game,

                position: args.position,
                velocity: SAT.randomNormal().scale(asteroidVelocityMagnitude),
                scale: args.scale || 128,

                image: self.IMAGE
            }
        );

        self._addAsteroidBodies();
    };

    _.extend(moddef.Asteroid.prototype, moddef.AsteroidsGameObject.prototype);
    moddef.Asteroid.prototype.constructor = moddef.Asteroid;

    moddef.Asteroid.prototype.IMAGE = new Image();
    moddef.Asteroid.prototype.IMAGE.src = "media/asteroid.png";

    moddef.Asteroid.prototype._addAsteroidBodies = function () {
        var self = this;

        var viewWidth = self.game.getWidth();
        var viewHeight = self.game.getHeight();
        var i;
        var j;

        for (i = -1; i <= 1; i += 1) {
            for (j = -1; j <= 1; j += 1) {
                if (i !== 0 || j !== 0) {
                    self.bodies.push(
                        new moddef.AsteroidsGameObjectBody({
                            parent: self,
                            offsetFromParent: new SAT.Vector(viewWidth * i, viewHeight * j)
                        })
                    );
                }
            }
        }
    };

    moddef.Asteroid.prototype.collidedWith = function (gameObject) {
        var self = this;
        var minimumScale = 32;

        if (gameObject.OBJECT_TYPE === moddef.Projectile.prototype.OBJECT_TYPE) {
            self.kill();
            gameObject.kill();

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

                self.game.gameObjects.push(new moddef.Asteroid(asteroidArguments));
                self.game.gameObjects.push(new moddef.Asteroid(asteroidArguments));
            }
        }
    };

    moddef.Ship.prototype.OBJECT_TYPE = 1;
    moddef.Asteroid.prototype.OBJECT_TYPE = 2;
    moddef.Projectile.prototype.OBJECT_TYPE = 3;

    return moddef;
});

