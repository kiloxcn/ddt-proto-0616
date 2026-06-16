import { QuotaPackage, AuthUser } from '../types';

class GlobalStore {
  private user: AuthUser | null = null;
  private packages: QuotaPackage[] = [
    { id: 'p1', duration: 60, price: 49, originalPrice: 99, status: 'active', createdAt: '2024-04-01 10:00:00' },
    { id: 'p2', duration: 500, price: 145, originalPrice: 399, status: 'active', createdAt: '2024-04-01 10:00:00' },
    { id: 'p3', duration: 600, price: 150, originalPrice: 499, status: 'active', createdAt: '2024-04-01 10:00:00' },
  ];

  constructor() {
    const savedUser = localStorage.getItem('ddt_user');
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('ddt_user');
      }
    }
    // Skip login flow by default: auto-login as simulated Administrator if no user is found
    if (!this.user) {
      this.user = {
        id: 'default_admin',
        username: 'admin',
        roles: ['DDT', 'ADMIN'],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      };
    }
  }

  getCurrentUser() {
    return this.user;
  }

  login(username: string, roles: string[], remember: boolean) {
    const user: AuthUser = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      roles,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + username
    };
    this.user = user;
    if (remember) {
      localStorage.setItem('ddt_user', JSON.stringify(user));
    }
    return user;
  }

  logout() {
    this.user = null;
    localStorage.removeItem('ddt_user');
  }

  getPackages() {
    return [...this.packages].sort((a, b) => a.duration - b.duration);
  }

  getActivePackages() {
    return this.packages.filter(p => p.status === 'active').sort((a, b) => a.duration - b.duration);
  }

  addPackage(pkg: Omit<QuotaPackage, 'id' | 'createdAt' | 'status'>) {
    const newPkg: QuotaPackage = {
      ...pkg,
      id: Math.random().toString(36).substr(2, 9),
      status: 'active',
      createdAt: new Date().toISOString().replace('T', ' ').split('.')[0]
    };
    this.packages.push(newPkg);
    return newPkg;
  }

  togglePackageStatus(id: string) {
    const pkg = this.packages.find(p => p.id === id);
    if (pkg) {
      pkg.status = pkg.status === 'active' ? 'inactive' : 'active';
    }
  }

  deletePackage(id: string) {
    this.packages = this.packages.filter(p => p.id !== id);
  }
}

export const globalStore = new GlobalStore();
