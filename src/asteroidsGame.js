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

        self.setCanvas(args.canvas);

        self.setWidth(args.width);
        self.setHeight(args.height);

        self._keysDownDict = {};

        self.drawingFrameSize = 1000.0 / framesPerSecond;
        self.updateFrameSize = 1000.0 / updatesPerSecond;

        $(window).keydown(function (event) {
            self._recordKeyDown(event.which);
        });

        $(window).keyup(function (event) {
            self._recordKeyUp(event.which);
        });

        self._ignoredCollisions = {};
        self.addIgnoredCollisionBetweenTypes(
            asteroids.Asteroid.prototype.OBJECT_TYPE,
            asteroids.Asteroid.prototype.OBJECT_TYPE
        );

        self.restart();
    };

    asteroids.AsteroidsGame.prototype.setCanvas = function (canvas) {
        var self = this;

        self._canvas = canvas;

        if (canvas) {
            self._drawingContext = self._canvas.getContext("2d");
        } else {
            self._drawingContext = null;
        }
    };

    asteroids.AsteroidsGame.prototype.getDrawingContext = function () {
        var self = this;

        return self._drawingContext;
    };

    asteroids.AsteroidsGame.prototype.getWidth = function () {
        var self = this;

        return self._width;
    };

    asteroids.AsteroidsGame.prototype.getHeight = function () {
        var self = this;

        return self._height;
    };

    asteroids.AsteroidsGame.prototype.setWidth = function (width) {
        var self = this;

        self._width = width;

        if (self._canvas) {
            self._canvas.width = self._width;
        }
    };

    asteroids.AsteroidsGame.prototype.setHeight = function (height) {
        var self = this;

        self._height = height;

        if (self._canvas) {
            self._canvas.height = self._height;
        }
    };

    asteroids.AsteroidsGame.prototype._recordKeyDown = function (code) {
        var self = this;

        self._keysDownDict[code] = true;
    };

    asteroids.AsteroidsGame.prototype._recordKeyUp = function (code) {
        var self = this;

        delete self._keysDownDict[code];
    };

    asteroids.AsteroidsGame.prototype.addIgnoredCollisionBetweenTypes = function (objectType1, objectType2) {
        var self = this;

        if (!(objectType1 in self._ignoredCollisions)) {
            self._ignoredCollisions[objectType1] = {};
        }

        self._ignoredCollisions[objectType1][objectType2] = true;
    };

    asteroids.AsteroidsGame.prototype.collissionIgnoredBetweenObjects = function (object1, object2) {
        var self = this;

        var objectType1 = object1.OBJECT_TYPE;
        var objectType2 = object2.OBJECT_TYPE;

        if (!(objectType1 in self._ignoredCollisions)) {
            return false;
        }

        return objectType2 in self._ignoredCollisions[objectType1];
    };

    asteroids.AsteroidsGame.prototype.isKeyDown = function (code) {
        var self = this;

        return self._keysDownDict[code] === true;
    };

    asteroids.AsteroidsGame.prototype.draw = function () {
        var self = this;

        self._drawingContext.clearRect(0, 0, self._canvas.width, self._canvas.height);

        _.each(self.gameObjects, function (gameObject) {
            gameObject.draw();
        });
    };

    asteroids.AsteroidsGame.prototype.getAsteroids = function () {
        var self = this;

        return _.filter(self.gameObjects, function (gameObject) {
            return gameObject.OBJECT_TYPE === asteroids.Asteroid.prototype.OBJECT_TYPE;
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
                    self._width * 0.5,
                    self._height * 0.5
                ),
                controlFunction: asteroids.AIControlFunction
            }),

            new asteroids.Asteroid({
                game: self,
                position: new SAT.Vector(
                    self._width * 0.25,
                    self._height * 0.25
                )
            }),

            new asteroids.Asteroid({
                game: self,
                position: new SAT.Vector(
                    self._width * 0.75,
                    self._height * 0.25
                )
            }),

            new asteroids.Asteroid({
                game: self,
                position: new SAT.Vector(
                    self._width * 0.25,
                    self._height * 0.75
                )
            }),

            new asteroids.Asteroid({
                game: self,
                position: new SAT.Vector(
                    self._width * 0.75,
                    self._height * 0.75
                )
            })
        ];
    };

    asteroids.AsteroidsGame.prototype.detectCollisions = function () {
        var self = this;
        var i;
        var j;

        for (i = 0; i < self.gameObjects.length - 1; i += 1) {
            for (j = i; j < self.gameObjects.length; j += 1) {
                var firstObject = self.gameObjects[i];
                var secondObject = self.gameObjects[j];

                if (self.collissionIgnoredBetweenObjects(firstObject, secondObject)) {
                    continue;
                }

                if (self.testCollissionBetweenObjects(firstObject, secondObject)) {
                    firstObject.collidedWith(secondObject);
                    secondObject.collidedWith(firstObject);
                }
            }
        }
    };

    asteroids.AsteroidsGame.prototype.testCollissionBetweenObjects = function (firstObject, secondObject) {
        return _.any(firstObject.bodies, function (firstBody) {
            return _.any(secondObject.bodies, function (secondBody) {
                var firstCollider = firstBody.getCircleCollider();
                var secondCollider = secondBody.getCircleCollider();

                return SAT.testCircleCircle(firstCollider, secondCollider);
            });
        });
    };

    asteroids.AsteroidsGame.prototype.run = function () {
        var self = this;

        setInterval(_.bind(self.draw, self), self.drawingFrameSize);
        setInterval(_.bind(self.update, self), self.updateFrameSize);
    };
}(window.asteroids = window.asteroids || {}));
