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
        var closestAsteroid = asteroids._getClosestAsteroid(ship);

        if (closestAsteroid === null) {
            return;
        }

        asteroids._turnShipTowardsAsteroid(ship, closestAsteroid);
        asteroids._approachAsteroid(ship, closestAsteroid);
    };

    asteroids._getClosestAsteroid = function (ship) {
        var asteroidGameObjects = _.filter(ship.game.gameObjects, function (gameObject) {
            return gameObject instanceof asteroids.Asteroid;
        });

        var closestAsteroid = _.min(asteroidGameObjects, function (asteroid) {
            return asteroids._combinedAsteroidDistance(ship, asteroid);
        });

        if (closestAsteroid === Infinity) {
            return null;
        }

        return closestAsteroid;
    };

    asteroids._combinedAsteroidDistance = function (ship, asteroid) {
        var asteroidOffset = _.clone(asteroid.position).sub(ship.position);

        var euclideanDistance = asteroidOffset.len();
        var angularDistance = mathHelperFunctions.minAngularDifference(
            ship.rotation,
            asteroid.rotation
        );

        return euclideanDistance / ship.MAXIMUM_VELOCITY_MAGNITUDE +
            angularDistance / ship.ANGULAR_VELOCITY;
    };

    asteroids._turnShipTowardsAsteroid = function (ship, asteroid) {
        var normalizedAsteroidRotation = mathHelperFunctions.normalizeAngle(
            asteroid.position.angleInRelationTo(ship.position)
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

    asteroids._approachAsteroid = function (ship, asteroid) {
        var asteroidOffset = _.clone(asteroid.position).sub(ship.position);

        var maxProjectileDistance = asteroids.Projectile.prototype.NUMBER_OF_FRAMES_TO_DEATH *
            asteroids.Projectile.prototype.VELOCITY_MAGNITUDE;

        var asteroidRadius = asteroid.getEnclosingCircleRadius();

        var distanceToCurrentOffset = asteroidOffset.len() - maxProjectileDistance - asteroidRadius;
        var lookAheadTime = distanceToCurrentOffset / (ship.MAXIMUM_VELOCITY_MAGNITUDE + asteroid.velocity.len());

        var futureAsteroidPosition = _.clone(asteroid.velocity).scale(lookAheadTime)
                                      .add(asteroid.position);

        var futureAsteroidOffset = _.clone(futureAsteroidPosition).sub(ship.position);

        var distanceToFutureOffset = futureAsteroidOffset.len() - maxProjectileDistance - asteroidRadius;

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
                if (!gameObject instanceof asteroids.Asteroid) {
                    return false;
                }

                var asteroid = gameObject;

                return _.any(ship.bodies, function (shipBody) {
                    return _.any(asteroid.bodies, function (asteroidBody) {
                        var lineOfSightRay = new SAT.Ray(
                            shipBody.getOffsetPosition(),
                            ship.getHeading()
                        );

                        return SAT.testRayCircle(lineOfSightRay, asteroidBody.getCircleCollider());
                    });
                });
            }
        );

        if (thereIsAnAsteroidWithinTheLineOfSight) {
            ship.fire();
        }
    };
}(window.asteroids = window.asteroids || {}));
