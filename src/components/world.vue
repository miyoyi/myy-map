<template>
    <div id="world"></div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as THREE from "three";
import earthFlyLine from "earth-flyline";

const router = useRouter();

const point = () => {
    const material = new THREE.PointsMaterial({
        color: '#ffffff',
        size: 2,
        transparent: true,
        opacity: 0.5,
    });

    let vertexPoint: number[] = [];
    let size = 1000;

    for (let i = 0; i < 5000; i++) {
        let x: number, y: number, z: number

        x = Math.random() * (size) - size / 2;
        y = Math.random() * (size) - size / 2;
        z = Math.random() * (size) - (size + 500);

        vertexPoint.push(x);
        vertexPoint.push(y);
        vertexPoint.push(z);
    }

    let geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertexPoint), 3));

    return new THREE.Points(geometry, material)
}

onMounted(() => {
    fetch('https://raw.githubusercontent.com/hululuuuuu/GlobeStream3D/main/src/map/world.json')
        .then(res => res.json())
        .then(res => {
            earthFlyLine.registerMap('world', res)
            const dom: HTMLElement = document.getElementById("world") as HTMLElement;
            const chart = earthFlyLine.init({
                dom,
                map: "world",
                config: {
                    scatterStyle: {
                        size: 5
                    }
                }
            });
            chart.scene.add(point())
            //新增数据
            chart.addData("flyLine", [
                {
                    from: {
                        id: 1,//string | number
                        lon: 112.45, //经度
                        lat: 34.62, //维度
                    },
                    to: {
                        id: 2,//string | number
                        lon: 119.306239, //经度
                        lat: 26.075302, //维度
                    },
                }
            ])
            chart.on('click', (event, params: any) => {
                if (params.name === 'China') {
                    router.replace({ name: 'map' })
                }
            })
        })
})
</script>
<style>
#world {
    width: 100vw;
    height: 100vh;
}
</style>
