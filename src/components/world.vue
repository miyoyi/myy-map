<template>
    <div id="world"></div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import earthFlyLine from "earth-flyline";

const router = useRouter();

onMounted(() => {
    fetch('https://raw.githubusercontent.com/hululuuuuu/GlobeStream3D/main/src/map/world.json')
        .then(res => res.json())
        .then(res => {
            earthFlyLine.registerMap('world', res)
            const dom = document.getElementById("world");
            const chart = earthFlyLine.init({
                dom,
                map: "world",
                config: {
                    scatterStyle: {
                        size: 5
                    }
                }
            });
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
                        lon: 14, //经度
                        lat: 52, //维度
                    },
                }
            ])
            chart.on('dblclick', (event, params) => {
                if (params.name === 'China') {
                    router.push({ name: 'map' })
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
