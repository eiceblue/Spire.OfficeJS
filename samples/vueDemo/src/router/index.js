import { createRouter, createWebHistory } from 'vue-router'
import FileUpload from '../views/FileUpload.vue'
import SpireOfficeJs from '../views/Spire.OfficeJs.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'upload',
            component: FileUpload
        },
        {
            path: '/document',
            name: 'document',
            component: SpireOfficeJs
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
})

export default router
