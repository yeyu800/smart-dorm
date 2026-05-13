import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 宿舍楼栋 Mock 数据
export const BUILDINGS = [
  { id: 'A', name: '求是苑A栋', floors: 6 },
  { id: 'B', name: '求是苑B栋', floors: 6 },
  { id: 'C', name: '励学苑C栋', floors: 8 },
  { id: 'D', name: '励学苑D栋', floors: 8 },
  { id: 'E', name: '博雅苑E栋', floors: 10 },
  { id: 'F', name: '博雅苑F栋', floors: 10 },
];

// 生成房间号列表（每层 01~20）
export function getRooms(floors) {
  const rooms = [];
  for (let f = 1; f <= floors; f++) {
    for (let r = 1; r <= 20; r++) {
      rooms.push(`${f}${String(r).padStart(2, '0')}`);
    }
  }
  return rooms;
}

// Mock 用户数据库（本地存储模拟）
const MOCK_USERS_KEY = 'smart_dorm_users';

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 当前登录用户（null = 未登录）
      currentUser: null,
      isLoggedIn: false,

      // 注册
      register: ({ username, password, nickname, building, room }) => {
        const users = loadUsers();
        if (users[username]) {
          return { success: false, message: '该用户名已被注册' };
        }
        const dormLabel = `${BUILDINGS.find(b => b.id === building)?.name ?? building} ${room}室`;
        const newUser = {
          username,
          password, // 真实项目应加密，这里演示用明文
          nickname: nickname || username,
          building,
          room,
          dormLabel,
          avatar: '🧑‍💻',
          role: '宿舍成员',
          joined: new Date().toLocaleDateString('zh-CN').replace(/\//g, '-'),
          createdAt: Date.now(),
        };
        users[username] = newUser;
        saveUsers(users);
        // 注册后自动登录
        set({ currentUser: newUser, isLoggedIn: true });
        return { success: true };
      },

      // 登录
      login: ({ username, password }) => {
        const users = loadUsers();
        const user = users[username];
        if (!user) {
          return { success: false, message: '用户名不存在' };
        }
        if (user.password !== password) {
          return { success: false, message: '密码错误' };
        }
        set({ currentUser: user, isLoggedIn: true });
        return { success: true };
      },

      // 登出
      logout: () => {
        set({ currentUser: null, isLoggedIn: false });
      },

      // 更新宿舍信息
      updateDorm: ({ building, room }) => {
        const dormLabel = `${BUILDINGS.find(b => b.id === building)?.name ?? building} ${room}室`;
        const users = loadUsers();
        const { currentUser } = get();
        if (!currentUser) return;
        const updated = { ...currentUser, building, room, dormLabel };
        users[currentUser.username] = updated;
        saveUsers(users);
        set({ currentUser: updated });
      },

      // 更新昵称/头像
      updateProfile: ({ nickname, avatar, role }) => {
        const users = loadUsers();
        const { currentUser } = get();
        if (!currentUser) return;
        const updated = { ...currentUser, nickname, avatar, role };
        users[currentUser.username] = updated;
        saveUsers(users);
        set({ currentUser: updated });
      },
    }),
    {
      name: 'smart-dorm-auth', // localStorage key
      partialize: (state) => ({
        currentUser: state.currentUser,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
