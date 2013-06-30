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

        self._debugPursuidAsteroidCircleImage = new Image();
        self._debugPursuidAsteroidCircleImage.src = "media/redCircle.png";

        self._debugAsteroidProjectionBoxImage = new Image();
        self._debugAsteroidProjectionBoxImage.src = "media/blueBox.png";

        self._debugArrowImage = new Image();
        self._debugArrowImage.src = "media/redArrow.png";

        self._debugAsteroidProjectionBoxes = null;
        self._debugAsteroidsAndFuturePositions = null;
        self._debugDesiredVelocity = null;
    };

    asteroids.AIControlFunction.prototype.draw = function () {
        var self = this;

        if (self.game.debugMode) {
            self._drawAsteroidCurrentAndFuturePositionsDebugCircles();
            self._drawAsteroidProjectionBoxes();
            self._drawDesiredVelocityDebugArrow();
        }
    };

    asteroids.AIControlFunction.prototype._drawAsteroidCurrentAndFuturePositionsDebugCircles = function () {
        var self = this;

        var drawingContext = self.game.getDrawingContext();
        var targetCircleMargin = 4;

        _.each(self._debugAsteroidsAndFuturePositions, function (asteroidAndFuturePosition) {
            var asteroid = asteroidAndFuturePosition.asteroid;
            var futureBodyPosition = asteroidAndFuturePosition.futureBodyPosition;
            var image = asteroidAndFuturePosition.image;

            var radius = asteroid.getEnclosingCircleRadius() + targetCircleMargin;
            var diameter = radius * 2;

            drawingContext.drawImage(
                image,

                asteroid.position.x - radius,
                asteroid.position.y - radius,

                diameter,
                diameter
            );

            drawingContext.drawImage(
                image,

                futureBodyPosition.x - radius,
                futureBodyPosition.y - radius,

                diameter,
                diameter
            );
        });
    };

    asteroids.AIControlFunction.prototype._drawAsteroidProjectionBoxes = function () {
        var self = this;

        var drawingContext = self.game.getDrawingContext();

        _.each(
            self._debugAsteroidProjectionBoxes,
            function (projectionBox) {
                drawingContext.translate(projectionBox.centerPosition.x, projectionBox.centerPosition.y);
                drawingContext.rotate(projectionBox.rotation);
                drawingContext.scale(projectionBox.width, projectionBox.height);

                drawingContext.translate(-0.5, -0.5);

                drawingContext.drawImage(
                    self._debugAsteroidProjectionBoxImage,

                    0,
                    0,

                    1,
                    1
                );

                twoDContextHelperFunctions.resetTransform(drawingContext);
            }
        );
    };

    asteroids.AIControlFunction.prototype._drawDesiredVelocityDebugArrow = function () {
        var self = this;

        if (!self._debugDesiredVelocity) {
            return;
        }

        var drawingContext = self.game.getDrawingContext();

        var radius = self._debugDesiredVelocity.len();
        var diameter = radius * 2;

        drawingContext.translate(self.ship.position.x, self.ship.position.y);
        drawingContext.rotate(self._debugDesiredVelocity.angle());
        drawingContext.scale(diameter, diameter);

        drawingContext.translate(-0.5, -0.5);

        drawingContext.drawImage(
            self._debugArrowImage,

            0,
            0,

            1,
            1
        );

        twoDContextHelperFunctions.resetTransform(drawingContext);
    };

    asteroids.AIControlFunction.prototype.update = function () {
        var self = this;

        self._debugAsteroidsAndFuturePositions = [];
        self._debugAsteroidProjectionBoxes = [];

        var totalForce = new SAT.Vector(0, 0);

        _.each(self.ship.game.getAsteroids(), function (asteroid) {
            var avoidanceForce = null;

            _.every(asteroid.bodies, function (asteroidBody) {
                avoidanceForce = self._getAvoidanceForce(asteroidBody);

                return avoidanceForce === null;
            });

            if (avoidanceForce !== null) {
                totalForce.add(avoidanceForce);
            }
        });

        var noAsteroidsToAvoid = totalForce.x === 0 && totalForce.y === 0;

        if (noAsteroidsToAvoid) {
            totalForce.add(self._getPursuitForce());
        }

        self._controlShipBasedOnDesiredVelocity(totalForce);
        self._applyFireBehaviour();
    };

    asteroids.AIControlFunction.prototype._getPursuitForce = function () {
        var self = this;

        var closestAsteroidBody = self._getClosestAsteroidBody();

        if (closestAsteroidBody === null) {
            return new SAT.Vector(0, 0);
        }

        var shipVelocityMagnitude = self.ship.velocity.len();

        var futurePositions = self._getFuturePositions(closestAsteroidBody);
        var closestBodyFuturePosition = futurePositions.asteroidBodyFuturePosition;

        var futureBodyOffset = _.clone(closestBodyFuturePosition).sub(self.ship.position);
        var shipProximityFactor = 0.75;

        var asteroidRadius = closestAsteroidBody.parent.getEnclosingCircleRadius();
        var shipRadius = self.ship.getEnclosingCircleRadius();
        var alteredProjectileDistance = asteroids.Projectile.prototype.MAX_DISTANCE * shipProximityFactor;

        var forceMagnitude = futureBodyOffset.len() -
            asteroidRadius - shipRadius - alteredProjectileDistance;

        if (shipVelocityMagnitude > forceMagnitude) {
            forceMagnitude = shipVelocityMagnitude;
        }

        self._debugAsteroidsAndFuturePositions.push({
            asteroid: closestAsteroidBody.parent,
            futureBodyPosition: closestBodyFuturePosition,
            image: self._debugPursuidAsteroidCircleImage
        });

        if (forceMagnitude === 0) {
            var replacementMagnitudeToMaintainDirection = 0.00000001;
            forceMagnitude = replacementMagnitudeToMaintainDirection;
        }

        return futureBodyOffset.normalize().scale(forceMagnitude);
    };

    asteroids.AIControlFunction.prototype._getAvoidanceForce = function (asteroidBody) {
        var self = this;

        var futurePositions = self._getFuturePositions(asteroidBody);

        var asteroidBodyFuturePosition = futurePositions.asteroidBodyFuturePosition;
        var shipFuturePosition = futurePositions.shipFuturePosition;

        var bodyPosition = asteroidBody.getOffsetPosition();

        var asteroidMovementProjectionBox = new SAT.RotatableBox(
            _.clone(asteroidBodyFuturePosition).sub(bodyPosition).scale(0.5).add(bodyPosition),
            asteroidBodyFuturePosition.angleInRelationTo(bodyPosition),
            asteroidBody.parent.scale,
            asteroidBodyFuturePosition.distanceTo(bodyPosition)
        );

        var shipMovementProjectionBox = new SAT.RotatableBox(
            _.clone(shipFuturePosition).sub(self.ship.position).scale(0.5).add(self.ship.position),
            shipFuturePosition.angleInRelationTo(self.ship.position),
            self.ship.scale,
            shipFuturePosition.distanceTo(self.ship.position)
        );

        self._debugAsteroidProjectionBoxes.push(asteroidMovementProjectionBox);

        var projectionBoxesOverlap = SAT.testPolygonPolygon(
            asteroidMovementProjectionBox.toPolygon(),
            shipMovementProjectionBox.toPolygon()
        );

        if (!projectionBoxesOverlap) {
            return null;
        }

        var force = _.clone(self.ship.position).sub(asteroidBody.getOffsetPosition());
        var forceMagnitude = self.ship.MAXIMUM_VELOCITY_MAGNITUDE;

        return force.normalize().scale(forceMagnitude);
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

    asteroids.AIControlFunction.prototype._getFuturePositions = function (asteroidBody) {
        var self = this;

        var bodyPosition = asteroidBody.getOffsetPosition();
        var asteroidVelocity = asteroidBody.parent.velocity;

        var lookAheadTime = self._combinedAsteroidBodyDistance(asteroidBody);

        var asteroidFuturePosition = _.clone(asteroidVelocity).scale(lookAheadTime).add(bodyPosition);

        var timeToBrake = -self.ship.velocity.len() / -self.ship.BRAKING_FORCE_MAGNITUDE;
        var shipLookAheadTime = lookAheadTime;

        if (shipLookAheadTime > timeToBrake) {
            shipLookAheadTime = timeToBrake;
        }

        var distanceCoveredByShip = self.ship.velocity.len() * shipLookAheadTime +
            -self.ship.BRAKING_FORCE_MAGNITUDE * shipLookAheadTime * shipLookAheadTime * 0.5;

        var shipFuturePosition = self.ship.getHeading().scale(distanceCoveredByShip)
            .add(self.ship.position);

        return {
            asteroidBodyFuturePosition: asteroidFuturePosition,
            shipFuturePosition: shipFuturePosition
        };
    };


    asteroids.AIControlFunction.prototype._combinedAsteroidBodyDistance = function (asteroidBody) {
        var self = this;

        var bodyPosition = asteroidBody.getOffsetPosition();

        var bodyOffset = _.clone(bodyPosition).sub(self.ship.position);
        var euclideanDistance = bodyOffset.len() - asteroidBody.parent.getEnclosingCircleRadius() -
            self.ship.getEnclosingCircleRadius();

        var angularDistance = mathHelperFunctions.minAngularDifference(
            self.ship.rotation,
            bodyOffset.angle()
        );

        return euclideanDistance / self.ship.MAXIMUM_VELOCITY_MAGNITUDE +
            angularDistance / self.ship.ANGULAR_VELOCITY;
    };

    asteroids.AIControlFunction.prototype._controlShipBasedOnDesiredVelocity = function (desiredVelocity) {
        var self = this;

        if (desiredVelocity.x === 0 && desiredVelocity.y === 0) {
            return;
        }

        self._debugDesiredVelocity = desiredVelocity;
        self._turnShipTowardsAngle(desiredVelocity.angle());

        var howMuchShipNeedsToTurn = mathHelperFunctions.minAngularDifference(
            desiredVelocity.angle(),
            self.ship.rotation
        );

        if (howMuchShipNeedsToTurn < Math.PI / 2 &&
            desiredVelocity.len() >= self.ship.velocity.len() + self.ship.ACTUAL_ACCELERATION_MAGNITUDE) {

            self.ship.accelerate();
        }
    };

    asteroids.AIControlFunction.prototype._turnShipTowardsAngle = function (angle) {
        var self = this;

        var normalizedShipRotation = mathHelperFunctions.normalizeAngle(self.ship.rotation);

        var minAngularDifference = mathHelperFunctions.minAngularDifference(
            angle,
            normalizedShipRotation
        );

        if (minAngularDifference < self.ship.ANGULAR_VELOCITY / 2) {
            return;
        }

        if (angle > normalizedShipRotation) {
            if (angle - normalizedShipRotation <= Math.PI) {
                self.ship.turn(1);
            } else {
                self.ship.turn(-1);
            }
        } else {
            if (normalizedShipRotation - angle <= Math.PI) {
                self.ship.turn(-1);
            } else {
                self.ship.turn(1);
            }
        }
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
