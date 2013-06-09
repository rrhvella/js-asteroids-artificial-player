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

    asteroids.SteeringBehavioursControlFunction = function (ship) {
        asteroids._ApplyPursuitBehaviour(ship);
        asteroids._ApplyFireBehaviour(ship);
    };

    asteroids._ApplyPursuitBehaviour = function (ship) {
        var asteroidGameObjects = _.filter(ship.game.gameObjects, function (gameObject) {
            return gameObject instanceof asteroids.StaticAsteroid;
        });

        var closestAsteroid = _.min(asteroidGameObjects, function (asteroid) {
            var asteroidAngleInRelationToShip = asteroid.position.angleInRelationTo(ship.position);

            return mathHelperFunctions.minAngularDifference(
                asteroid.rotation,
                asteroidAngleInRelationToShip
            );
        });

        if (closestAsteroid === Infinity) {
            return;
        }

        var normalizedAsteroidRotation = mathHelperFunctions.normalizeAngle(
            closestAsteroid.position.angleInRelationTo(ship.position)
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

    asteroids._ApplyFireBehaviour = function (ship) {
        var lineOfSightRay = new SAT.Ray(ship.position, ship.getHeading());

        var thereIsAnAsteroidWithinTheLineOfSight = _.any(
            ship.game.gameObjects,
            function (gameObject) {
                return gameObject instanceof asteroids.StaticAsteroid &&
                    SAT.testRayCircle(lineOfSightRay, gameObject.getCircleCollider());
            }
        );

        if (thereIsAnAsteroidWithinTheLineOfSight) {
            ship.fire();
        }
    };
}(window.asteroids = window.asteroids || {}));