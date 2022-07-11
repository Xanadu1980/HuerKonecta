import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { PostComponent } from './post/post.component';
import { AboutComponent } from './about/about.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { TeamComponent } from './team/team.component';
import { ProfileComponent } from './profile/profile.component';
import { CommentComponent } from './comment/comment.component';
import { ActivityComponent } from './activity/activity.component';
import { TaskComponent } from './task/task.component';
import { OptionListComponent } from './option-list/option-list.component';
import { PartnersComponent } from './partners/partners.component';
import { TramitesComponent } from './tramites/tramites.component';
import { UsersListComponent } from './users-list/users-list.component';

const routes: Routes = [
	{ path: '', 
    redirectTo: 'welcome', 
    pathMatch: 'full' 
  },
  {
    path: '',
    component: HomeComponent,
    children: [
      { component: PostComponent, path: 'post' },
      { component: OptionListComponent, path: 'option-list' },
      { component: CommentComponent, path: 'post/:id' },
      { component: AboutComponent, path: 'about' },
      { component: ActivityComponent, path: 'activities' },
      { component: TaskComponent, path: 'task' },
      { component: ContactUsComponent, path: 'contact-us' },
      { component: TeamComponent, path: 'team' },
      { component: ProfileComponent, path: 'profile/:username' },
      { component: ProfileComponent, path: 'myprofile/:username' },
      { component: PartnersComponent, path: 'partners' },
      { component: TramitesComponent, path: 'tramites' },
      { component: UsersListComponent, path: 'users-list' },
    ]
  },
 ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class HomeRoutingModule { }
