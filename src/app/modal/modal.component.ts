import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgbAlert],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() headersExtracted = new EventEmitter<string[]>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Output() fileSelected = new EventEmitter<File | null>();

  @Input() isVisible: boolean = false;

  isDragOver = false;
  uploadInProgress: boolean = false;
  headers: string[] = [];
  invalidFileType: boolean = false;

  openModal() {
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
    this.invalidFileType = false
  }

  onClick(): void {
    this.fileInput.nativeElement.click();
    this.invalidFileType = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.invalidFileType = false;
    if (input && input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      if (
        selectedFile.type === 'text/csv' ||
        selectedFile.name.endsWith('.csv')
      ) {
        //this.file = selectedFile;
        //this.fileSelected.emit(this.file);
      } else {
        this.invalidFileType = true;
        input.value = '';
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
    this.invalidFileType = false;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }



  extractHeaders(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      const allRows = csvData.split(/\r?\n|\r/);
      if (allRows.length > 0) {
        const headerRow = allRows[0];
        this.headers = headerRow.split(',').map((header) => header.trim());
        this.headersExtracted.emit(this.headers);
      }
    };
    reader.readAsText(file);
  }


}


