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

        asteroids._turnShipTowardsAsteroidBody(ship, closestAsteroidBody);
        asteroids._approachAsteroidBody(ship, closestAsteroidBody);
    };

    asteroids._getClosestAsteroidBody = function (ship) {
        var asteroidGameObjects = _.filter(ship.game.gameObjects, function (gameObject) {
            return gameObject instanceof asteroids.Asteroid;
        });

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

    asteroids._combinedAsteroidBodyDistance = function (ship, asteroidBody) {
        var bodyPosition = asteroidBody.getOffsetPosition();

        var bodyOffset = _.clone(bodyPosition).sub(ship.position);
        var euclideanDistance = bodyOffset.len();

        var angularDistance = mathHelperFunctions.minAngularDifference(
            ship.rotation,
            bodyOffset.angle()
        );

        return euclideanDistance / ship.MAXIMUM_VELOCITY_MAGNITUDE +
            angularDistance / ship.ANGULAR_VELOCITY;
    };

    asteroids._turnShipTowardsAsteroidBody = function (ship, asteroidBody) {
        var normalizedAsteroidRotation = mathHelperFunctions.normalizeAngle(
            asteroidBody.getOffsetPosition().angleInRelationTo(ship.position)
        );

        var normalizedShipRotation = mathHelperFunctions.normalizeAngle(ship.rotation);

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

    asteroids._approachAsteroidBody = function (ship, asteroidBody) {
        var bodyPosition = asteroidBody.getOffsetPosition();
        var bodyOffset = _.clone(bodyPosition).sub(ship.position);

        var maxProjectileDistance = asteroids.Projectile.prototype.NUMBER_OF_FRAMES_TO_DEATH *
            asteroids.Projectile.prototype.VELOCITY_MAGNITUDE;

        var asteroidRadius = asteroidBody.parent.getEnclosingCircleRadius();
        var asteroidVelocity = asteroidBody.parent.velocity;

        var distanceToCurrentOffset = bodyOffset.len() - maxProjectileDistance - asteroidRadius;
        var lookAheadTime = distanceToCurrentOffset / (ship.MAXIMUM_VELOCITY_MAGNITUDE +
            asteroidVelocity.len());

        var futureBodyPosition = _.clone(asteroidVelocity).scale(lookAheadTime)
            .add(bodyPosition);

        var futureBodyOffset = _.clone(futureBodyPosition).sub(ship.position);

        var shipProximityFactor = 0.75;
        var distanceToFutureOffset = futureBodyOffset.len() - maxProjectileDistance *
            shipProximityFactor - asteroidRadius;

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
            ship.game.gameObjects,
            function (gameObject) {
                if (!(gameObject instanceof asteroids.Asteroid)) {
                    return false;
                }

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
