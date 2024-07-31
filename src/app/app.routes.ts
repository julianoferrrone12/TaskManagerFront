import { Routes } from '@angular/router';
import { TaskManagerComponent } from './taskManager/taskManager.component';

export const routes: Routes = [
    { path: '', redirectTo: '/task-list', pathMatch: 'full' },
    { path: 'task-list', component: TaskManagerComponent },
];