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
        self.rotation = 0;

        self.scale = args.scale;

        self.image = new Image();
        self.image.src = args.imageSrc;

        self.velocity = new SAT.Vector(0, 0);
    };

    asteroids.AsteroidsGameObject.prototype.draw = function () {
        var self = this;

        self.game.drawingContext.translate(self.position.x, self.position.y);
        self.game.drawingContext.rotate(self.rotation);
        self.game.drawingContext.scale(self.scale, self.scale);

        self.game.drawingContext.translate(-0.5, -0.5);

        self.game.drawingContext.drawImage(self.image, 0, 0, 1, 1);

        twoDContextHelpers.resetTransform(self.game.drawingContext);
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
    };

    asteroids.AIControlledShip = function (args) {
        var self = this;

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

    _.extend(asteroids.AIControlledShip.prototype, asteroids.AsteroidsGameObject.prototype);
    asteroids.AIControlledShip.prototype.constructor = asteroids.AIControlledShip;

    asteroids.AIControlledShip.prototype.normalizeAngle = function () {
        var self = this;
        var twoPI = Math.PI * 2;

        self.rotation = self.rotation % twoPI;

        if (self.rotation < 0) {
            self.rotation += twoPI;
        }
    };

    asteroids.AIControlledShip.prototype.getHeading = function () {
        var self = this;

        self.normalizeAngle();

        var result = new SAT.Vector(-Math.sin(self.rotation), Math.cos(self.rotation));
        result.normalize();

        return result;
    };

    asteroids.AIControlledShip.prototype.accelerate = function () {
        var self = this;

        var accelerationMagnitude = 5;
        self.velocity.add(self.getHeading().scale(accelerationMagnitude));
    };

    asteroids.AIControlledShip.prototype.turn = function (direction) {
        var self = this;

        var rotationAmount = Math.PI * 0.07;
        self.rotation += rotationAmount * direction;

        self.normalizeAngle();
    };

    asteroids.AIControlledShip.prototype.update = function () {
        var self = this;

        var dampeningFactor = 0.95;
        self.velocity.scale(dampeningFactor);

        if (self.game.isKeyDown(asteroids.KeyCodes.UP)) {
            self.accelerate();
        }

        if (self.game.isKeyDown(asteroids.KeyCodes.RIGHT)) {
            self.turn(1);
        } else if (self.game.isKeyDown(asteroids.KeyCodes.LEFT)) {
            self.turn(-1);
        }

        self.position.add(self.velocity);

        asteroids.AsteroidsGameObject.prototype.update.call(self);
    };

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
}(window.asteroids = window.asteroids || {}));
