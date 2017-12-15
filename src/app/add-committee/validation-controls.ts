import { AbstractControl } from '@angular/forms';

export function ValidateGreaterThan(controlBig: AbstractControl, controlSmall: AbstractControl) {
  if (controlBig.value <= controlSmall.value) {
    return { validDate: true };
  }
  return null;
}
