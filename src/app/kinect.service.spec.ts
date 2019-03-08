import { TestBed } from '@angular/core/testing';

import { KinectService } from './kinect.service';

describe('KinectService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KinectService = TestBed.get(KinectService);
    expect(service).toBeTruthy();
  });
});
