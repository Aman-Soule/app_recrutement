import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { ImagePreview } from '../../shared/components/image-preview/image-preview';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Header, ConfirmDialog, ImagePreview],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
