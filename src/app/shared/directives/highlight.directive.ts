import { AfterViewInit, Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[highlight]',
  standalone: false
})
export class HighlightDirective implements AfterViewInit {

  @Input() color = 'yellow';

  // Une Directive peut injecter l'élément HTML sur lequel elle est placée avec  ElementRef  , et interagir avec cet élément avec  Renderer2 

  constructor(private el: ElementRef,
              private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.setBackgroundColor(this.color);
  }

  setBackgroundColor(color: string) {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
  }

  // réagir aux événements HTML émanant de l'élément sur lequel elle est placée.
  @HostListener('mouseenter') onMouseEnter() {
    this.setBackgroundColor('lightgreen');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.setBackgroundColor(this.color);
  }

  @HostListener('click') onClick() {
    this.color = 'lightgreen';
  }
}