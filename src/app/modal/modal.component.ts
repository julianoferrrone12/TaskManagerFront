import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.css',
    standalone: true
})
export class ModalComponent {
    @Input() modalTitle: string = '';
    @Input() buttonText: string = '';
    @Input() modalExitTitle: string = '';
    @Input() buttonExitText: string = '';
    @Input() buttonClickHandler!: () => void;
    @Output() modalClosed = new EventEmitter<void>();

    constructor() { }

    handleButtonClick(): void {
        if (this.buttonClickHandler) {
            this.buttonClickHandler();
        }
        this.modalClosed.emit();
    }

    closeModal(): void {
        this.modalClosed.emit();
    }

}