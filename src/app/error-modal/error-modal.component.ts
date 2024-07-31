import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ErrorModalComponent {
  @Input() errorMessage: string = '';
  @Output() closeErrorModal = new EventEmitter<void>();

  closeModal(): void {
    this.closeErrorModal.emit();
  }
}
