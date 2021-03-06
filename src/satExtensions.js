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

define(["mathHelperFunctions", "sat"], function (mathHelperFunctions) {
    "use strict";

    (function (SAT) {
        SAT.angleToNormal = function (angle) {
            return new SAT.Vector(-Math.sin(angle), Math.cos(angle));
        };

        SAT.randomNormal = function () {
            return SAT.angleToNormal(Math.random() * 2 * Math.PI);
        };

        SAT.Vector.prototype.clamp = function (maximumMagnitude) {
            var self = this;

            if (self.len() > maximumMagnitude) {
                self.normalize().scale(maximumMagnitude);
            }
        };

        SAT.Vector.prototype.angle = function () {
            var self = this;

            return mathHelperFunctions.normalizeAngle(Math.atan2(-self.x, self.y));
        };

        SAT.Vector.prototype.distanceTo = function (other) {
            var self = this;

            return self.clone().sub(other).len();
        };

        SAT.Vector.prototype.angleInRelationTo = function (other) {
            var self = this;

            return self.clone().sub(other).angle();
        };

        SAT.Vector.prototype.clone = function () {
            var self = this;

            return new SAT.Vector(self.x, self.y);
        };

        SAT.Ray = function (origin, direction) {
            var self = this;

            self.origin = origin ? origin.clone() : new SAT.Vector();

            if (direction) {
                self.direction = direction.clone().normalize();
            } else {
                self.direction = new SAT.Vector();
            }
        };

        SAT.RotatableBox = function (centerPosition, rotation, width, height) {
            var self = this;

            self.centerPosition = centerPosition;
            self.rotation = rotation;

            self.width = width;
            self.height = height;
        };

        SAT.RotatableBox.prototype.toPolygon = function () {
            var self = this;

            var xAxisOrientation = mathHelperFunctions.normalizeAngle(self.rotation - Math.PI / 2);
            var yAxisOrientation = self.rotation;

            var xAxis = SAT.angleToNormal(xAxisOrientation);
            var yAxis = SAT.angleToNormal(yAxisOrientation);

            var halfWidth = self.width / 2;
            var halfHeight = self.height / 2;

            return new SAT.Polygon(
                self.centerPosition.clone(),
                [
                    xAxis.clone().scale(-halfWidth).add(yAxis.clone().scale(-halfHeight)),
                    xAxis.clone().scale(-halfWidth).add(yAxis.clone().scale(halfHeight)),
                    xAxis.clone().scale(halfWidth).add(yAxis.clone().scale(halfHeight)),
                    xAxis.clone().scale(halfWidth).add(yAxis.clone().scale(-halfHeight))
                ]
            );
        };

        SAT.testRayCircle = function (ray, circle) {
            if (ray.direction.x === 0 && ray.direction.y === 0) {
                return false;
            }

            var ox = ray.origin.x - circle.pos.x;
            var oy = ray.origin.y - circle.pos.y;

            var dx = ray.direction.x;
            var dy = ray.direction.y;

            var rSquared = circle.r * circle.r;

            var rootInput = rSquared * dx * dx - Math.pow(dy * ox - dx * oy, 2) + rSquared * dy * dy;

            if (rootInput < 0) {
                return false;
            }

            var dotOriginDirection = dx * ox + dy * oy;

            return Math.sqrt(rootInput) > dotOriginDirection;
        };
    }(window.SAT = window.SAT || {}));
});