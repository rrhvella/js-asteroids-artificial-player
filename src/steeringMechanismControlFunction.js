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

    asteroids.SteeringMechanismControlFunction = function (ship) {
        var forces = asteroids._getEvadeForces(ship);
        forces.push(asteroids._getPirsuitForce(ship));

        var desiredVelocity = _.reduce(
            forces,
            function (memo, force) {
                return memo.add(force);
            }
        );

        asteroids._controlShipBasedOnDesiredVelocity(ship, desiredVelocity);
        asteroids._applyFireBehaviour(ship);
    };

    asteroids._getEvadeForces = function (ship) {
        var asteroidGameObjects = ship.game.getAsteroids();

        return _.map(
            asteroidGameObjects,
            function (asteroid) {
                return asteroids._getEvadeForce(ship, asteroid);
            }
        );
    };

    asteroids._getEvadeForce = function (ship, asteroid) {
        var lookAheadTime = asteroids._getLookAheadTime(ship, asteroid);

        var futureAsteroidPosition = _.clone(asteroid.velocity).scale(lookAheadTime)
            .add(asteroid.position);

        var futureShipPosition = _.clone(ship.velocity).scale(lookAheadTime)
            .add(ship.position);

        var futureAsteroidCircleCollider = asteroid.getCircleCollider();
        futureAsteroidCircleCollider.pos = futureAsteroidPosition;

        var futureShipCircleCollider = asteroid.getCircleCollider();
        futureShipCircleCollider.pos = futureShipPosition;

        if (!SAT.testCircleCircle(futureAsteroidCircleCollider, futureShipCircleCollider)) {
            return new SAT.Vector(0, 0);
        }

        var shipOffsetFromAsteroid = _.clone(ship.position).sub(futureAsteroidPosition);

        var forceNormal = shipOffsetFromAsteroid.normalize();
        return forceNormal.scale(ship.MAXIMUM_VELOCITY_MAGNITUDE);
    };

    asteroids._getPirsuitForce = function (ship) {
        var closestAsteroid = asteroids._getClosestAsteroid(ship);

        if (closestAsteroid === null) {
            return new SAT.Vector(0, 0);
        }

        return asteroids._getOffsetToFiringDistance(ship, closestAsteroid);
    };

    asteroids._getOffsetToFiringDistance = function (ship, asteroid) {
        var asteroidRadius = asteroid.getEnclosingCircleRadius();

        var maxProjectileDistance = asteroids.Projectile.prototype.NUMBER_OF_FRAMES_TO_DEATH *
            asteroids.Projectile.prototype.VELOCITY_MAGNITUDE;

        var lookAheadTime = asteroids._getLookAheadTime(ship, asteroid);

        var futureAsteroidPosition = _.clone(asteroid.velocity).scale(lookAheadTime)
            .add(asteroid.position);

        var futureAsteroidOffset = _.clone(futureAsteroidPosition).sub(ship.position);

        var forceMagnitude = futureAsteroidOffset.len() - maxProjectileDistance - asteroidRadius;
        var forceNormal = futureAsteroidOffset.normalize();

        return forceNormal.scale(forceMagnitude);
    };

    asteroids._getLookAheadTime = function (ship, asteroid) {
        return asteroids._combinedAsteroidDistance(ship, asteroid) /
            (ship.MAXIMUM_VELOCITY_MAGNITUDE + asteroid.velocity.len());
    };


    asteroids._controlShipBasedOnDesiredVelocity = function (ship, desiredVelocity) {
        var desiredVelocityAngle = mathHelperFunctions.normalizeAngle(desiredVelocity.angle());
        asteroids._rotateShipTowardsAngle(ship, desiredVelocityAngle);

        var differenceInAngles = mathHelperFunctions.minAngularDifference(
            desiredVelocityAngle,
            ship.rotation
        );

        if (differenceInAngles < Math.PI / 4 && desiredVelocity.len2() > ship.velocity.len2()) {
            ship.accelerate();
        }
    };

    asteroids._rotateShipTowardsAngle = function (ship, angle) {
        var normalizedShipRotation = mathHelperFunctions.normalizeAngle(ship.rotation);

        if (angle > normalizedShipRotation) {
            if (angle - normalizedShipRotation <= Math.PI) {
                ship.turn(1);
            } else {
                ship.turn(-1);
            }
        } else {
            if (normalizedShipRotation - angle <= Math.PI) {
                ship.turn(-1);
            } else {
                ship.turn(1);
            }
        }
    };
}(window.asteroids = window.asteroids || {}));
