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

        self.position = args.position;
        self.rotation = args.rotation || 0;

        self.scale = args.scale;

        self.image = new Image();
        self.image.src = args.imageSrc;

        self.velocity = args.velocity || new SAT.Vector(0, 0);
    };

    asteroids.AsteroidsGameObject.prototype.draw = function () {
        var self = this;

        self.game.drawingContext.translate(self.position.x, self.position.y);
        self.game.drawingContext.rotate(self.rotation);
        self.game.drawingContext.scale(self.scale, self.scale);

        self.game.drawingContext.translate(-0.5, -0.5);

        self.game.drawingContext.drawImage(self.image, 0, 0, 1, 1);

        twoDContextHelperFunctions.resetTransform(self.game.drawingContext);
    };

    asteroids.AsteroidsGameObject.prototype.update = function () {
        var self = this;

        var x = self.position.x;
        var y = self.position.y;

        var canvasWidth = self.game.canvas.width;
        var canvasHeight = self.game.canvas.height;

        if (x - self.scale > canvasWidth || x + self.scale <= 0) {
            self.position.x = canvasWidth - x;
        }

        if (y - self.scale > canvasHeight || y + self.scale <= 0) {
            self.position.y = canvasHeight - y;
        }

        self.position.add(self.velocity);
    };

    asteroids.AsteroidsGameObject.prototype.kill = function () {
        var self = this;

        self.game.gameObjects = _.without(self.game.gameObjects, self);
    };

    asteroids.AsteroidsGameObject.prototype.getCircleCollider = function () {
        var self = this;

        return new SAT.Circle(self.position, self.scale / 2);
    };

    asteroids.AsteroidsGameObject.prototype.collidedWith = function (gameObject) {
    };

    asteroids.Ship = function (args) {
        var self = this;

        self._shootingIntervalPassed = true;
        self.controlFunction = args.controlFunction;

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

    _.extend(asteroids.Ship.prototype, asteroids.AsteroidsGameObject.prototype);
    asteroids.Ship.prototype.constructor = asteroids.AIControlledShip;

    asteroids.Ship.prototype.getHeading = function () {
        var self = this;

        self.rotation = mathHelperFunctions.normalizeAngle(self.rotation);

        var result = new SAT.Vector(-Math.sin(self.rotation), Math.cos(self.rotation));
        result.normalize();

        return result;
    };

    asteroids.Ship.prototype.accelerate = function () {
        var self = this;

        var accelerationMagnitude = 5;
        var maximumVelocity = 40;

        self.velocity.add(self.getHeading().scale(accelerationMagnitude));
        self.velocity.clamp(maximumVelocity);
    };

    asteroids.Ship.prototype.turn = function (direction) {
        var self = this;

        var rotationAmount = Math.PI * 0.07;
        self.rotation += rotationAmount * direction;

        self.rotation = mathHelperFunctions.normalizeAngle(self.rotation);
    };

    asteroids.Ship.prototype.update = function () {
        var self = this;

        var dampeningFactor = 0.95;
        self.velocity.scale(dampeningFactor);

        self.controlFunction(self);

        asteroids.AsteroidsGameObject.prototype.update.call(self);
    };

    asteroids.Ship.prototype.fire = function () {
        var self = this;

        if (!self._shootingIntervalPassed) {
            return;
        }

        self.game.gameObjects.push(
            new asteroids.Projectile({
                game: self.game,

                position: (new SAT.Vector()).copy(self.position),
                direction: self.getHeading()
            })
        );

        self._shootingIntervalPassed = false;

        setTimeout(
            function () {
                self._shootingIntervalPassed = true;
            },
            self.game.updateFrameSize * 5
        );
    };

    asteroids.Projectile = function (args) {
        var self = this;

        var projectileVelocity = 100;
        var velocity = args.direction.scale(projectileVelocity);

        _.extend(args, {
            scale: 5,
            velocity: velocity,
            position: args.position.add(velocity),
            imageSrc: "media/asteroid.png"
        });

        asteroids.AsteroidsGameObject.call(self, args);

        var timeToDeath = self.game.updateFrameSize * 5;
        setTimeout(_.bind(self.kill, self), timeToDeath);
    };

    _.extend(asteroids.Projectile.prototype, asteroids.AsteroidsGameObject.prototype);
    asteroids.Projectile.prototype.constructor = asteroids.Projectile;

    asteroids.StaticAsteroid = function (args) {
        var self = this;

        asteroids.AsteroidsGameObject.call(
            self,
            {
                game: args.game,

                position: args.position,
                scale: 128,

                imageSrc: "media/asteroid.png"

            }
        );
    };

    _.extend(asteroids.StaticAsteroid.prototype, asteroids.AsteroidsGameObject.prototype);
    asteroids.StaticAsteroid.prototype.constructor = asteroids.StaticAsteroid;

    asteroids.StaticAsteroid.prototype.collidedWith = function (gameObject) {
        var self = this;

        if (gameObject instanceof asteroids.Projectile) {
            self.kill();
        }
    };
}(window.asteroids = window.asteroids || {}));
