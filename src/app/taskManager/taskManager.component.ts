import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { TaskManagerService, Task, QueryObject } from '../taskManager.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { ErrorModalComponent } from '../error-modal/error-modal.component';

@Component({
    selector: 'app-taskManager',
    templateUrl: './taskManager.component.html',
    standalone: true,
    imports: [
        CommonModule, ModalComponent, FormsModule, ReactiveFormsModule, DropdownComponent, ErrorModalComponent
    ],
    styleUrls: ['./taskManager.component.css'],
})
export class TaskManagerComponent implements OnInit {
    @ViewChild(DropdownComponent) dropdownComponent!: DropdownComponent;
    @ViewChild(ErrorModalComponent) errorModalComponent!: ErrorModalComponent;

    tasks: Task[] = [];
    query: QueryObject = {
        sortBy: 'createdDate',
        isDescending: true,
        pageNumber: 1,
        pageSize: 10
    };
    filteredTasks: Task[] = [];
    pagedTasks: Task[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 5;
    totalPages: number = 1;
    isEditing: boolean = false;
    showModal: boolean = false;
    isErrorVisible: boolean = false;
    taskToEdit: Task | null = null;
    searchName: string = '';
    searchStatus: string = '';
    sortOrder: 'asc' | 'desc' = 'asc';
    errorMessage: string = '';

    statusOptions = [
        { value: '', label: 'Todos' },
        { value: 'Pending', label: 'Não iniciada' },
        { value: 'InProgress', label: 'Em andamento' },
        { value: 'Completed', label: 'Realizada' }
    ];

    @Output() modalClosed = new EventEmitter<void>();

    forms = new FormGroup({
        name: new FormControl(''),
        description: new FormControl('')
    });

    constructor(private taskManagerService: TaskManagerService) { }

    ngOnInit(): void {
        this.loadItems();
    }

    loadItems(): void {
        this.taskManagerService.getItems(this.query).subscribe(
            (response) => {
                if (Array.isArray(response)) {
                    this.tasks = response;
                    console.log('Received tasks:', this.tasks);
                    this.totalPages = Math.ceil(this.tasks.length / this.itemsPerPage);
                    this.applyFilters();
                } else {
                    console.error('Response is not an array:', response);
                }
            },
            (error) => {
                console.error('Error fetching tasks:', error);
                this.errorMessage = error.message;
                this.isErrorVisible = true;
            }
        );
    }



    applyFilters(): void {
        let filtered = this.tasks.filter(task =>
            (this.searchName ? task.name.toLowerCase().includes(this.searchName.toLowerCase()) : true) &&
            (this.searchStatus ? task.status === this.searchStatus : true)
        );
        filtered = this.sortTasks(filtered);
        this.filteredTasks = filtered;
        this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        this.setPage(this.currentPage);
    }


    sortTasks(tasks: Task[]): Task[] {
        const isDescending = this.query.isDescending;
        return tasks.sort((a, b) => {
            if (this.query.sortBy === 'CreatedDate') {
                const dateA = new Date(a.createdDate).getTime();
                const dateB = new Date(b.createdDate).getTime();
                return isDescending ? dateB - dateA : dateA - dateB;
            } else if (this.query.sortBy === 'Name') {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();
                return isDescending ? (nameA < nameB ? 1 : -1) : (nameA > nameB ? 1 : -1);
            }
            return 0;
        });
    }




    setPage(page: number): void {
        this.currentPage = page;
        const start = (page - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.pagedTasks = this.filteredTasks.slice(start, end);
    }

    sortBy(field: string): void {
        if (this.query.sortBy === field) {
            this.query.isDescending = !this.query.isDescending;
        } else {
            this.query.sortBy = field;
            this.query.isDescending = true;
        }
        this.loadItems();
    }

    onStatusSelected(selectedValue: string): void {
        this.searchStatus = selectedValue;
    }

    openEditModal(task: Task): void {
        this.taskToEdit = task;
        this.isEditing = true;
        this.showModal = true;
        this.forms.patchValue({
            name: task.name,
            description: task.description
        });
    }

    clearFormFields(): void {
        this.isEditing = false;
        this.forms.reset();
    }

    openCreateModal(): void {
        this.isEditing = false;
        this.showModal = true;
        this.forms.reset();
    }

    handleFormSubmit(): void {
        if (this.isEditing) {
            this.editTask(this.taskToEdit);
        } else {
            this.createTask();
        }
    }

    createTask(): void {
        const formsData = this.forms.value;
        const payload = {
            name: formsData.name,
            description: formsData.description
        };

        this.taskManagerService.createTask(payload).subscribe({
            next: (response) => {
                console.log('Item criado com sucesso:', response);
                this.loadItems();
            },
            error: (error) => {
                console.error('Erro ao criar o item:', error);
                this.errorMessage = error.message;
                this.isErrorVisible = true;
            }
        });
    }

    editTask(task: Task | null): void {
        if (task) {
            const formsData = this.forms.value;
            const payload = {
                name: formsData.name,
                description: formsData.description,
            };

            this.taskManagerService.editTask(task.id, payload).subscribe({
                next: (response) => {
                    console.log('Item editado com sucesso:', response);
                    this.loadItems();
                },
                error: (error) => {
                    console.error('Erro ao editar o item:', error);
                    this.errorMessage = error.message;
                    this.isErrorVisible = true;
                }
            });
        } else {
            console.error('Tarefa a ser editada é nula.');
        }
    }

    deleteTask(taskId: number): void {
        this.taskManagerService.deleteTask(taskId)
            .subscribe(() => {
                this.tasks = this.tasks.filter(task => task.id !== taskId);
                this.filteredTasks = this.filteredTasks.filter(task => task.id !== taskId);
                this.applyFilters();
            });
    }

    updateTaskStatus(task: Task): void {
        const updatedTask = {
            ...task,
            status: task.status
        };

        this.taskManagerService.editTask(task.id, updatedTask)
            .subscribe(response => {
                console.log('Status atualizado com sucesso:', response);
            }, error => {
                console.error('Erro ao atualizar o status:', error);
            });
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.setPage(page);
        }
    }

    clearFilters(): void {
        this.searchName = '';
        this.searchStatus = '';
        this.applyFilters();

        if (this.dropdownComponent) {
            this.dropdownComponent.reset();
        }
    }

    closeErrorModal(): void {
        this.isErrorVisible = false;
    }
}
