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

    asteroids.AIControlFunction = function (args) {
        var self = this;

        self.ship = args.ship;
        self.game = args.game;
    };

    asteroids.AIControlFunction.prototype.draw = function () {
    };

    asteroids.AIControlFunction.prototype.update = function () {
        var self = this;

        self._applyPursuitBehaviour();
        self._applyFireBehaviour();
    };

    asteroids.AIControlFunction.prototype._applyPursuitBehaviour = function () {
        var self = this;

        var closestAsteroidBody = self._getClosestAsteroidBody();

        if (closestAsteroidBody === null) {
            return;
        }

        var closestBodyFuturePosition = self._getFuturePosition(closestAsteroidBody);

        self._turnShipTowardsFutureAsteroidBody(
            closestAsteroidBody,
            closestBodyFuturePosition
        );

        self._approachFutureAsteroidBody(
            closestAsteroidBody,
            closestBodyFuturePosition
        );
    };

    asteroids.AIControlFunction.prototype._getClosestAsteroidBody = function () {
        var self = this;

        var asteroidGameObjects = self.ship.game.getAsteroids();

        var asteroidBodies = _.flatten(
            _.map(asteroidGameObjects, function (asteroid) {
                return asteroid.bodies;
            })
        );

        var closestAsteroid = _.min(asteroidBodies, function (asteroidBody) {
            return self._combinedAsteroidBodyDistance(asteroidBody);
        });

        if (closestAsteroid === Infinity) {
            return null;
        }

        return closestAsteroid;
    };

    asteroids.AIControlFunction.prototype._getFuturePosition = function (asteroidBody) {
        var self = this;

        var bodyPosition = asteroidBody.getOffsetPosition();
        var asteroidVelocity = asteroidBody.parent.velocity;

        var lookAheadTime = self._combinedAsteroidBodyDistance(asteroidBody);
        return _.clone(asteroidVelocity).scale(lookAheadTime).add(bodyPosition);
    };


    asteroids.AIControlFunction.prototype._combinedAsteroidBodyDistance = function (asteroidBody) {
        var self = this;

        var bodyPosition = asteroidBody.getOffsetPosition();

        var bodyOffset = _.clone(bodyPosition).sub(self.ship.position);
        var euclideanDistance = bodyOffset.len() - asteroidBody.parent.getEnclosingCircleRadius();

        var angularDistance = mathHelperFunctions.minAngularDifference(
            self.ship.rotation,
            bodyOffset.angle()
        );

        return euclideanDistance / self.ship.MAXIMUM_VELOCITY_MAGNITUDE +
            angularDistance / self.ship.ANGULAR_VELOCITY;
    };

    asteroids.AIControlFunction.prototype._turnShipTowardsFutureAsteroidBody = function (asteroidBody, futurePosition) {
        var self = this;

        var normalizedAsteroidRotation = mathHelperFunctions.normalizeAngle(
            futurePosition.angleInRelationTo(self.ship.position)
        );

        var normalizedShipRotation = mathHelperFunctions.normalizeAngle(self.ship.rotation);

        var minAngularDifference = mathHelperFunctions.minAngularDifference(
            normalizedAsteroidRotation,
            normalizedShipRotation
        );

        if (minAngularDifference < self.ship.ANGULAR_VELOCITY / 2) {
            return;
        }

        if (normalizedAsteroidRotation > normalizedShipRotation) {
            if (normalizedAsteroidRotation - normalizedShipRotation <= Math.PI) {
                self.ship.turn(1);
            } else {
                self.ship.turn(-1);
            }
        } else {
            if (normalizedShipRotation - normalizedAsteroidRotation <= Math.PI) {
                self.ship.turn(-1);
            } else {
                self.ship.turn(1);
            }
        }
    };

    asteroids.AIControlFunction.prototype._approachFutureAsteroidBody = function (asteroidBody, futurePosition) {
        var self = this;

        var futureOffset = _.clone(futurePosition).sub(self.ship.position);

        var shipProximityFactor = 0.75;

        var asteroidRadius = asteroidBody.parent.getEnclosingCircleRadius();
        var alteredProjectileDistance = asteroids.Projectile.prototype.MAX_DISTANCE * shipProximityFactor;


        var distanceToFutureOffset = futureOffset.len() - alteredProjectileDistance - asteroidRadius;

        if (distanceToFutureOffset <= 0) {
            return;
        }

        var breakingDistance = self.ship.velocity.len2() / (2 * self.ship.BRAKING_FORCE_MAGNITUDE);

        if (breakingDistance > distanceToFutureOffset) {
            return;
        }

        self.ship.accelerate();
    };

    asteroids.AIControlFunction.prototype._applyFireBehaviour = function () {
        var self = this;

        var thereIsAnAsteroidWithinTheLineOfSight = _.any(
            self.ship.game.getAsteroids(),
            function (gameObject) {
                var lineOfSightRay = new SAT.Ray(self.ship.position, self.ship.getHeading());

                return _.any(gameObject.bodies, function (asteroidBody) {
                    return SAT.testRayCircle(lineOfSightRay, asteroidBody.getCircleCollider());
                });
            }
        );

        if (thereIsAnAsteroidWithinTheLineOfSight) {
            self.ship.fire();
        }
    };
}(window.asteroids = window.asteroids || {}));
