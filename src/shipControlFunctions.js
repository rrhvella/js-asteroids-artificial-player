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

    asteroids.HumanInputControlFunction = function (ship) {
        if (ship.game.isKeyDown(asteroids.KeyCodes.UP)) {
            ship.accelerate();
        }

        if (ship.game.isKeyDown(asteroids.KeyCodes.RIGHT)) {
            ship.turn(1);
        } else if (ship.game.isKeyDown(asteroids.KeyCodes.LEFT)) {
            ship.turn(-1);
        }

        if (ship.game.isKeyDown(asteroids.KeyCodes.SPACE)) {
            ship.fire();
        }
    };

    asteroids.AIControlFunction = function (ship) {
        asteroids._applyPursuitBehaviour(ship);
        asteroids._applyFireBehaviour(ship);
    };

    asteroids._applyPursuitBehaviour = function (ship) {
        var closestAsteroidBody = asteroids._getClosestAsteroidBody(ship);

        if (closestAsteroidBody === null) {
            return;
        }

        var closestBodyFuturePosition = asteroids._getFuturePosition(ship, closestAsteroidBody);

        asteroids._turnShipTowardsFutureAsteroidBody(
            ship,
            closestAsteroidBody,
            closestBodyFuturePosition
        );

        asteroids._approachFutureAsteroidBody(
            ship,
            closestAsteroidBody,
            closestBodyFuturePosition
        );
    };

    asteroids._getClosestAsteroidBody = function (ship) {
        var asteroidGameObjects = ship.game.getAsteroids();

        var asteroidBodies = _.flatten(
            _.map(asteroidGameObjects, function (asteroid) {
                return asteroid.bodies;
            })
        );

        var closestAsteroid = _.min(asteroidBodies, function (asteroidBody) {
            return asteroids._combinedAsteroidBodyDistance(ship, asteroidBody);
        });

        if (closestAsteroid === Infinity) {
            return null;
        }

        return closestAsteroid;
    };

    asteroids._getFuturePosition = function (ship, asteroidBody) {
        var bodyPosition = asteroidBody.getOffsetPosition();
        var asteroidVelocity = asteroidBody.parent.velocity;

        var lookAheadTime = asteroids._combinedAsteroidBodyDistance(ship, asteroidBody);
        return _.clone(asteroidVelocity).scale(lookAheadTime).add(bodyPosition);
    };


    asteroids._combinedAsteroidBodyDistance = function (ship, asteroidBody) {
        var bodyPosition = asteroidBody.getOffsetPosition();

        var bodyOffset = _.clone(bodyPosition).sub(ship.position);
        var euclideanDistance = bodyOffset.len() - asteroidBody.parent.getEnclosingCircleRadius();

        var angularDistance = mathHelperFunctions.minAngularDifference(
            ship.rotation,
            bodyOffset.angle()
        );

        return euclideanDistance / ship.MAXIMUM_VELOCITY_MAGNITUDE +
            angularDistance / ship.ANGULAR_VELOCITY;
    };

    asteroids._turnShipTowardsFutureAsteroidBody = function (ship, asteroidBody, futurePosition) {
        var normalizedAsteroidRotation = mathHelperFunctions.normalizeAngle(
            futurePosition.angleInRelationTo(ship.position)
        );

        var normalizedShipRotation = mathHelperFunctions.normalizeAngle(ship.rotation);

        var minAngularDifference = mathHelperFunctions.minAngularDifference(
            normalizedAsteroidRotation,
            normalizedShipRotation
        );

        if (minAngularDifference < ship.ANGULAR_VELOCITY / 2) {
            return;
        }

        if (normalizedAsteroidRotation > normalizedShipRotation) {
            if (normalizedAsteroidRotation - normalizedShipRotation <= Math.PI) {
                ship.turn(1);
            } else {
                ship.turn(-1);
            }
        } else {
            if (normalizedShipRotation - normalizedAsteroidRotation <= Math.PI) {
                ship.turn(-1);
            } else {
                ship.turn(1);
            }
        }
    };

    asteroids._approachFutureAsteroidBody = function (ship, asteroidBody, futurePosition) {
        var futureOffset = _.clone(futurePosition).sub(ship.position);

        var shipProximityFactor = 0.75;

        var asteroidRadius = asteroidBody.parent.getEnclosingCircleRadius();
        var alteredProjectileDistance = asteroids.Projectile.prototype.MAX_DISTANCE * shipProximityFactor;


        var distanceToFutureOffset = futureOffset.len() - alteredProjectileDistance - asteroidRadius;

        if (distanceToFutureOffset <= 0) {
            return;
        }

        var breakingDistance = ship.velocity.len2() / (2 * ship.BRAKING_FORCE_MAGNITUDE);

        if (breakingDistance > distanceToFutureOffset) {
            return;
        }

        ship.accelerate();
    };

    asteroids._applyFireBehaviour = function (ship) {
        var thereIsAnAsteroidWithinTheLineOfSight = _.any(
            ship.game.getAsteroids(),
            function (gameObject) {
                var lineOfSightRay = new SAT.Ray(ship.position, ship.getHeading());

                return _.any(gameObject.bodies, function (asteroidBody) {
                    return SAT.testRayCircle(lineOfSightRay, asteroidBody.getCircleCollider());
                });
            }
        );

        if (thereIsAnAsteroidWithinTheLineOfSight) {
            ship.fire();
        }
    };
}(window.asteroids = window.asteroids || {}));
