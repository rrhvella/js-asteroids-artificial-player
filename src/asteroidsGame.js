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

    asteroids.AsteroidsGame = function (args) {
        var self = this;

        var framesPerSecond = 30;
        var updatesPerSecond = 20;

        self.canvas = args.canvas;
        self.drawingContext = self.canvas.getContext("2d");
        self._keysDownDict = {};

        self.drawingFrameSize = 1000.0 / framesPerSecond;
        self.updateFrameSize = 1000.0 / updatesPerSecond;

        $(window).keydown(function (event) {
            self._recordKeyDown(event.which);
        });

        $(window).keyup(function (event) {
            self._recordKeyUp(event.which);
        });

        self.restart();
    };

    asteroids.AsteroidsGame.prototype._recordKeyDown = function (code) {
        var self = this;

        self._keysDownDict[code] = true;
    };

    asteroids.AsteroidsGame.prototype._recordKeyUp = function (code) {
        var self = this;

        delete self._keysDownDict[code];
    };

    asteroids.AsteroidsGame.prototype.isKeyDown = function (code) {
        var self = this;

        return self._keysDownDict[code] === true;
    };

    asteroids.AsteroidsGame.prototype.draw = function () {
        var self = this;

        self.drawingContext.clearRect(0, 0, self.canvas.width, self.canvas.height);

        _.each(self.gameObjects, function (gameObject) {
            gameObject.draw();
        });
    };

    asteroids.AsteroidsGame.prototype.getAsteroids = function () {
        var self = this;

        return _.filter(self.gameObjects, function (gameObject) {
            return gameObject instanceof asteroids.Asteroid;
        });
    };

    asteroids.AsteroidsGame.prototype.update = function () {
        var self = this;

        self.detectCollisions();

        _.each(self.gameObjects, function (gameObject) {
            gameObject.update();
        });
    };

    asteroids.AsteroidsGame.prototype.restart = function () {
        var self = this;

        self.gameObjects = [
            new asteroids.Ship({
                game: self,
                position: new SAT.Vector(
                    self.canvas.width * 0.5,
                    self.canvas.height * 0.5
                ),
                controlFunction: asteroids.AIControlFunction
            }),

            new asteroids.Asteroid({
                game: self,
                position: new SAT.Vector(
                    self.canvas.width * 0.25,
                    self.canvas.height * 0.25
                )
            }),

            new asteroids.Asteroid({
                game: self,
                position: new SAT.Vector(
                    self.canvas.width * 0.75,
                    self.canvas.height * 0.25
                )
            }),

            new asteroids.Asteroid({
                game: self,
                position: new SAT.Vector(
                    self.canvas.width * 0.25,
                    self.canvas.height * 0.75
                )
            }),

            new asteroids.Asteroid({
                game: self,
                position: new SAT.Vector(
                    self.canvas.width * 0.75,
                    self.canvas.height * 0.75
                )
            })
        ];
    };

    asteroids.AsteroidsGame.prototype.detectCollisions = function () {
        var self = this;
        var i;
        var j;

        for (i = 0; i < self.gameObjects.length - 1; i += 1) {
            for (j = 0; j < self.gameObjects.length; j += 1) {
                var firstObject = self.gameObjects[i];
                var secondObject = self.gameObjects[j];

                var firstCollider = firstObject.getCircleCollider();
                var secondCollider = secondObject.getCircleCollider();

                if (SAT.testCircleCircle(firstCollider, secondCollider)) {
                    firstObject.collidedWith(secondObject);
                    secondObject.collidedWith(firstObject);
                }
            }
        }
    };

    asteroids.AsteroidsGame.prototype.run = function () {
        var self = this;

        setInterval(_.bind(self.draw, self), self.drawingFrameSize);
        setInterval(_.bind(self.update, self), self.updateFrameSize);
    };
}(window.asteroids = window.asteroids || {}));
