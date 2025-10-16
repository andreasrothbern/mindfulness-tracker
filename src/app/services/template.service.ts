// src/app/services/template.service.ts

import { Injectable, signal } from '@angular/core';
import { TriggerTemplate, DEFAULT_TEMPLATES } from '../models/template.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly STORAGE_KEY = 'trigger-templates';

  templates = signal<TriggerTemplate[]>(this.loadTemplates());

  constructor() {}

  private loadTemplates(): TriggerTemplate[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const customTemplates = JSON.parse(stored) as TriggerTemplate[];
      return [...DEFAULT_TEMPLATES, ...customTemplates];
    }
    return DEFAULT_TEMPLATES;
  }

  private saveCustomTemplates(): void {
    const customTemplates = this.templates().filter(t => t.isCustom);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
  }

  addCustomTemplate(template: Omit<TriggerTemplate, 'id' | 'isCustom'>): void {
    const newTemplate: TriggerTemplate = {
      ...template,
      id: this.generateId(),
      isCustom: true
    };

    const templates = [...this.templates(), newTemplate];
    this.templates.set(templates);
    this.saveCustomTemplates();
  }

  deleteTemplate(id: string): void {
    const template = this.templates().find(t => t.id === id);
    if (template && template.isCustom) {
      const templates = this.templates().filter(t => t.id !== id);
      this.templates.set(templates);
      this.saveCustomTemplates();
    }
  }

  getTemplate(id: string): TriggerTemplate | undefined {
    return this.templates().find(t => t.id === id);
  }

  getDefaultTemplates(): TriggerTemplate[] {
    return this.templates().filter(t => !t.isCustom);
  }

  getCustomTemplates(): TriggerTemplate[] {
    return this.templates().filter(t => t.isCustom);
  }

  private generateId(): string {
    return 'custom-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
