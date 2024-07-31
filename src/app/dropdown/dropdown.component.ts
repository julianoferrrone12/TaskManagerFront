import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent {
  @Input() options: { value: string, label: string }[] = [];
  @Input() placeholder: string = '';
  @Output() optionSelected = new EventEmitter<string>();

  isOpen = false;
  selectedValue: string = '';
  selectedLabel: string = this.placeholder;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: { value: string, label: string }): void {
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;
    this.optionSelected.emit(this.selectedValue);
  }

  reset(): void {
    this.selectedValue = '';
    this.selectedLabel = this.placeholder;
    this.optionSelected.emit(this.selectedValue);
  }
}
