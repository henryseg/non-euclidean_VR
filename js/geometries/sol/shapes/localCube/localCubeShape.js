import {intersection, LocalXYHalfSpaceShape, LocalZHalfSpaceShape} from "../all.js";
import {Isometry} from "../../geometry/General.js";
import {Point} from "../../geometry/General.js";

export function localCubeShape(isom, halfWidth) {
    const front = new LocalZHalfSpaceShape(
        new Isometry().makeTranslation(new Point(0, 0, halfWidth))
    );
    const back = new LocalZHalfSpaceShape(
        new Isometry().makeTranslation(new Point(0, 0, -halfWidth))
            .multiply(new Isometry().makeFlip())
    );
    const left = new LocalXYHalfSpaceShape(
        new Isometry().makeTranslation(new Point(halfWidth, 0, 0))
    );
    const right = new LocalXYHalfSpaceShape(
        new Isometry().makeTranslation(new Point(-halfWidth, 0, 0))
            .multiply(new Isometry().makeReflectionX())
    );
    const top = new LocalXYHalfSpaceShape(
        new Isometry().makeTranslation(new Point(0, halfWidth, 0))
            .multiply(new Isometry().makeFlip())
    );
    const bottom = new LocalXYHalfSpaceShape(
        new Isometry().makeTranslation(new Point(0, -halfWidth, 0))
            .multiply(new Isometry().makeReflectionY())
            .multiply(new Isometry().makeFlip())
    );

    const shape = intersection(top, bottom, front, back, left, right);
    shape.isom = isom;
    return shape;
}