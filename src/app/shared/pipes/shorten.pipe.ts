import { Pipe, PipeTransform } from '@angular/core';


// decorateur @Pipe avec un name
@Pipe({
  name: 'shorten',
  standalone: false,

})
  
export class ShortenPipe implements PipeTransform {
  transform(value: string, maxlength = 50): string {
    if (value.length <= maxlength) {
      return value;
    }
    return value.substring(0, maxlength) + '…';
  }
}