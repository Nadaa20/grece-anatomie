import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

function dtr(degrees: number) {
    return (degrees * Math.PI) / 180;
}

const Camera: React.FC = () => {
    const { scene, camera, gl } = useThree();
    const pivot = useRef(new THREE.Object3D());
    const moveDirection = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false,
    });
    const isRightClickPressed = useRef(false);
    const previousMouseX = useRef(0);

    useEffect(() => {
        camera.position.set(5, 20, 22);
        camera.rotation.set(dtr(-50), 0, 0);

        pivot.current.add(camera);
        scene.add(pivot.current);

        const CAMERA_SPEED = 0.6;
        const MIN_ZOOM = 5;
        const MAX_ZOOM = 500;
        const ROTATION_SPEED = 1;

        const updateCameraPosition = () => {
            const dir = new THREE.Vector3();
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
                pivot.current.quaternion
            );
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
                pivot.current.quaternion
            );

            const directions = moveDirection.current;

            if (directions.forward) dir.add(forward);
            if (directions.backward) dir.sub(forward);
            if (directions.right) dir.add(right);
            if (directions.left) dir.sub(right);
            if (directions.up) pivot.current.position.y += CAMERA_SPEED;
            if (directions.down) pivot.current.position.y -= CAMERA_SPEED;

            if (dir.length() > 0) {
                dir.normalize();
                pivot.current.position.addScaledVector(dir, CAMERA_SPEED);
            }
        };

        const handleWheel = (e: WheelEvent) => {
            camera.position.y -= e.deltaY * -0.05;
            camera.position.y = Math.max(
                MIN_ZOOM,
                Math.min(MAX_ZOOM, camera.position.y)
            );
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key.toLowerCase()) {
                case "z":
                    moveDirection.current.forward = true;
                    break;
                case "s":
                    moveDirection.current.backward = true;
                    break;
                case "q":
                    moveDirection.current.left = true;
                    break;
                case "d":
                    moveDirection.current.right = true;
                    break;
                case "arrowup":
                    moveDirection.current.up = true;
                    break;
                case "arrowdown":
                    moveDirection.current.down = true;
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key.toLowerCase()) {
                case "z":
                    moveDirection.current.forward = false;
                    break;
                case "s":
                    moveDirection.current.backward = false;
                    break;
                case "q":
                    moveDirection.current.left = false;
                    break;
                case "d":
                    moveDirection.current.right = false;
                    break;
                case "arrowup":
                    moveDirection.current.up = false;
                    break;
                case "arrowdown":
                    moveDirection.current.down = false;
                    break;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isRightClickPressed.current) {
                const deltaX = e.clientX - previousMouseX.current;
                pivot.current.rotation.y -= deltaX * ROTATION_SPEED * 0.001;
            }
            previousMouseX.current = e.clientX;
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 2) {
                isRightClickPressed.current = true;
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (e.button === 2) {
                isRightClickPressed.current = false;
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const animate = () => {
            updateCameraPosition();
            requestAnimationFrame(animate);
        };
        animate();

        gl.domElement.addEventListener("wheel", handleWheel);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("contextmenu", handleContextMenu);

        return () => {
            scene.remove(pivot.current);
            gl.domElement.removeEventListener("wheel", handleWheel);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [camera, gl, scene]);

    return null;
};

export default Camera;
