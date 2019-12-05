/**
 * 基础数学运算
 * @author cary
 */
namespace MathUtil {
    export const EPSILON = 2.2204460492503130808472633361816E-16;

    export const DEG_TO_RAD: number = (Math.PI * 2) / 360;
    export const RAD_TO_DEG: number = 360 / (Math.PI * 2);

    export const HALF_PI: number = Math.PI / 2;

    export type Point = { x: number, y: number };

    export function clamp(v: number, min: number = 0, max: number = 1): number {
        if (v < min) {
            return min;
        }
        if (v > max) {
            return max;
        }
        return v;
    }

    /**
     * @returns 整数 [min - max)
     */
    export function random(min: number, max: number): number {
        return ~~(Math.random() * (max - min) + min);
    }

    /**
     * @returns 浮点数 [min - max)
     */
    export function randomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    export function toRadians(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    export function toDegrees(radians: number): number {
        return radians * 180 / Math.PI;
    }

    export function radians(x1: number, y1: number, x2: number, y2: number): number {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.atan2(dy, dx);
    }

    export function radians2(point1: Point, point2: Point): number {
        let dx = point2.x - point1.x;
        let dy = point2.y - point1.y;
        return Math.atan2(dy, dx);
    }

    export function degrees(x1: number, y1: number, x2: number, y2: number): number {
        return MathUtil.toDegrees(MathUtil.radians(x1, y1, x2, y2));
    }

    export function degrees2(point1: Point, point2: Point): number {
        return MathUtil.toDegrees(MathUtil.radians2(point1, point2));
    }

    export function distance(x1: number, y1: number, x2: number, y2: number): number {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    export function distance2(point1: Point, point2: Point): number {
        let dx = point2.x - point1.x;
        let dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    export function distanceSquare(x1: number, y1: number, x2: number, y2: number): number {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    export function distanceSquare2(point1: Point, point2: Point): number {
        let dx = point2.x - point1.x;
        let dy = point2.y - point1.y;
        return dx * dx + dy * dy;
    }

    export function getPointByRadian(nowX: number, nowY: number, radian: number, distance: number, result?: Point): Point {
        let point = new egret.Point;
        point.setTo(nowX, nowY);
        return getPointByRadian2(point, radian, distance, result);
    }

    export function getPointByRadian2(now: Point, radian: number, distance: number, result?: Point): Point {
        if (!result) {
            result = new egret.Point;
        }
        let distX = distance * egret.NumberUtils.cos(radian / DEG_TO_RAD);
        let distY = distance * egret.NumberUtils.sin(radian / DEG_TO_RAD);
        result.x = now.x + distX;
        result.y = now.y + distY;
        return result;
    }

    export function getPointInterpolate(p1: Point, p2: Point, progress: number, result?: Point): Point {
        if (!result) {
            result = new egret.Point;
        }
        progress = 1 - progress;
        var progress1 = 1 - progress;
        result.x = p1.x * progress + p2.x * progress1;
        result.y = p1.y * progress + p2.y * progress1;
        return result;
    }

    export function getEllipsePoint(centerX: number, centerY: number, radiusX: number, radiusY: number, radian: number, result?: Point): Point {
        if (!result) {
            result = new egret.Point;
        }
        radian -= HALF_PI;
        result.x = -Math.sin(radian) * radiusX + centerX;
        result.y = Math.cos(radian) * radiusY + centerY;
        return result;
    }

    /**
     * 根据概率得知是否中奖
     */
    export function winning(rate: number): boolean {
        return Math.random() < rate;
    }

    /**
     * 计算两条线段的交点
     * 不相交则返回false，否则返回交点坐标
     */
    export function getCross(a: Point, b: Point, c: Point, d: Point): boolean | Point {
        let denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
        if (denominator == 0) {
            return false;
        }
        // 线段所在直线的交点坐标 (x , y)      
        let x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
            + (b.y - a.y) * (d.x - c.x) * a.x
            - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
        let y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
            + (b.x - a.x) * (d.y - c.y) * a.y
            - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;
        let point = new egret.Point;
        point.x = ~~x;
        point.y = ~~y;
        return point;
    }

    /**
     * 两矩形是否相交
     */
    export function isRectOverlap(x1: number, y1: number, width1: number, height1: number, x2: number, y2: number, width2: number, height2: number, ) {
        let left1 = x1;
        let top1 = y1;
        let right1 = x1 + width1;
        let bottom1 = y1 + height1;

        let left2 = x2;
        let top2 = y2;
        let right2 = x2 + width2;
        let bottom2 = y2 + height2;

        return !(((right1 < left2) || (bottom1 > top2)) ||
            ((right2 < left1) || (bottom2 > top1))
        );
    }
}
