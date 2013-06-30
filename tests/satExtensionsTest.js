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

(function () {
    "use strict";

    var Ray = SAT.Ray;
    var Circle = SAT.Circle;
    var Vector = SAT.Vector;
    var RotatableBox = SAT.RotatableBox;

    var polygonContainsAllPoints = function (polygon, points) {
        var maximumError = 0.0001;
        _.each(
            points,
            function (queryVector) {
                ok(
                    _.any(
                        polygon.points,
                        function (recordVector) {
                            return recordVector.x - queryVector.x < maximumError &&
                                recordVector.y - queryVector.y < maximumError;
                        }
                    )
                );
            }
        );
    };

    test("Rotatable box returns regular box polygon at 0 rotation.", function () {
        var rotateableBox = new RotatableBox(new Vector(0, 0), 0, 2, 1);
        var polygon = rotateableBox.toPolygon();

        polygonContainsAllPoints(
            polygon,
            [
                new Vector(-1, -0.5),
                new Vector(-1, 0.5),
                new Vector(1, -0.5),
                new Vector(1, 0.5)
            ]
        );
    });

    test("Rotatable box returns perpendicular box polygon at Pi/2 rotation.", function () {
        var rotateableBox = new RotatableBox(new Vector(0, 0), Math.PI / 2, 2, 1);
        var polygon = rotateableBox.toPolygon();

        polygonContainsAllPoints(
            polygon,
            [
                new Vector(-0.5, -1),
                new Vector(-0.5, 1),
                new Vector(0.5, -1),
                new Vector(0.5, 1)
            ]
        );
    });

    test("Rotatable box returns diagonal box polygon at Pi/4 rotation.", function () {
        var rotateableBox = new RotatableBox(new Vector(0, 0), Math.PI / 4, 2, 1);
        var polygon = rotateableBox.toPolygon();

        polygonContainsAllPoints(
            polygon,
            [
                new Vector(0.3536, 1.0607),
                new Vector(1.0607, 0.3536),
                new Vector(-0.3536, -1.0607),
                new Vector(-1.0607, -0.3536)
            ]
        );
    });

    test("Vector angle returns 0 for vector facing down", function () {
        equal(new Vector(0, 1).angle(), 0);
    });

    test("Vector angle returns 0 for 0 vector", function () {
        equal(new Vector(0, 0).angle(), 0);
    });

    test("Vector angle returns pi for vector facing up", function () {
        equal(new Vector(0, -1).angle(), Math.PI);
    });

    test("Vector angle returns is not affected by magnitude", function () {
        equal(new Vector(0, -200).angle(), Math.PI);
    });

    test("testRayCircle returns false for ray with no direction.", function () {
        var ray = new Ray(new Vector(0, 0), new Vector(0, 0));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(!SAT.testRayCircle(ray, circle));
    });

    test("testRayCircle returns true for ray within the circle.", function () {
        var ray = new Ray(new Vector(0, 0), new Vector(1, 1));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(SAT.testRayCircle(ray, circle));
    });

    test("testRayCircle returns false for ray positioned on the circumference.", function () {
        var ray = new Ray(new Vector(10, 0), new Vector(1, 1));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(!SAT.testRayCircle(ray, circle));
    });

    test("testRayCircle returns false for ray not facing the circle.", function () {
        var ray = new Ray(new Vector(11, 0), new Vector(1, 0));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(!SAT.testRayCircle(ray, circle));
    });

    test("testRayCircle returns false for circle not on the ray's line.", function () {
        var ray = new Ray(new Vector(0, 11), new Vector(1, 0));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(!SAT.testRayCircle(ray, circle));
    });

    test("testRayCircle returns true for ray facing the circle.", function () {
        var ray = new Ray(new Vector(11, 0), new Vector(-1, 0));
        var circle = new Circle(new Vector(0, 0), 10);

        ok(SAT.testRayCircle(ray, circle));
    });
}());
