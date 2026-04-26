import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Settings, 
  Calendar, 
  Shield, 
  ShieldOff, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Award,
  User,
  Check,
  Trash2,
  Gamepad2,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { Medication, MedicationLog, UserPreferences, MedicationCategory, Achievement, CalendarTodo } from './types';
import { storage } from './lib/storage';
import { cn } from './lib/utils';
import { 
  format, 
  addDays, 
  isSameDay, 
  startOfDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isToday, 
  isFuture,
  subMonths,
  addMonths,
  isSameMonth
} from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- Constants & Resources ---

const DISEASE_KNOWLEDGE: Record<string, { note: string, tip: string, full: { diet: string[], lifestyle: string[], medication: string[] } }> = {
  hypertension: {
    note: "长期坚持，不可自行停药或减量。",
    tip: "少放一勺盐，血管压力小一点。",
    full: {
      diet: ["每日盐摄入 < 5g", "减少腌制食品", "增加钾摄入（如香蕉）"],
      lifestyle: ["适度有氧运动", "避免情绪剧烈波动", "定期测量血压"],
      medication: ["不可自行停药", "观察是否有头晕、脚踝水肿等反应"]
    }
  },
  diabetes: {
    note: "注意低血糖反应（头晕、出汗）。",
    tip: "餐后走一走，血糖稳如狗。",
    full: {
      diet: ["低糖饮食", "定时定量", "控制总热量"],
      lifestyle: ["餐后 30 分钟适度运动", "注意足部护理", "预防感染"],
      medication: ["监测餐后血糖", "预防低血糖反应"]
    }
  },
  lipid: {
    note: "多数降脂药（如他汀类）建议晚间服用。",
    tip: "少吃一口肥肉，清理血管垃圾。",
    full: {
      diet: ["低脂低胆固醇", "多食纤维素", "严格限制动物脂肪"],
      lifestyle: ["戒烟限酒", "保持体重", "避免久坐"],
      medication: ["晚上服用效果更佳", "监测肝功能指标"]
    }
  },
  coronary: {
    note: "随身携带急救药；注意硝酸甘油有效期。",
    tip: "温差大，出门记得多穿件衣服，保护心脏。",
    full: {
      diet: ["清淡饮食", "少食多餐", "避免暴饮暴食"],
      lifestyle: ["注意保暖", "避免剧烈运动", "保持大便通畅"],
      medication: ["硝酸甘油及急救药随身携带", "不可突然停药"]
    }
  },
  copd: {
    note: "掌握吸入剂正确用法，吸药后需漱口。",
    tip: "深呼吸，扩扩肺，空气更清新。",
    full: {
      diet: ["高蛋白易消化", "多喝水", "少食多餐"],
      lifestyle: ["彻底戒烟", "呼吸操训练", "远离粉尘环境"],
      medication: ["正确使用雾化/吸入器", "吸入后充分漱口"]
    }
  }
};

// --- Components ---

const Navbar = ({ currentPath, onNavigate, stealthMode, toggleStealth }: { 
  currentPath: string, 
  onNavigate: (path: string) => void,
  stealthMode: boolean,
  toggleStealth: () => void
}) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 md:top-0 md:bottom-auto md:flex-col md:w-64 md:h-full md:border-t-0 md:border-r md:px-4 md:py-6 md:items-stretch">
    <div className="hidden md:flex items-center gap-3 px-3 mb-8">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
      </div>
      <span className="font-bold text-xl tracking-tight text-slate-800">药小叮</span>
    </div>

    <div className="flex justify-around w-full md:flex-col md:gap-1 md:justify-start">
      <button 
        onClick={() => onNavigate('home')}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all", 
          currentPath === 'home' ? "bg-indigo-50 text-primary shadow-sm" : "text-slate-500 hover:bg-slate-50"
        )}
      >
        <Home size={20} className={cn(currentPath === 'home' ? "text-primary" : "text-slate-400")} />
        <span className="hidden md:inline text-sm font-medium">打卡</span>
      </button>
      <button 
        onClick={() => onNavigate('plan')}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all", 
          currentPath === 'plan' ? "bg-indigo-50 text-primary shadow-sm" : "text-slate-500 hover:bg-slate-50"
        )}
      >
        <Calendar size={20} className={cn(currentPath === 'plan' ? "text-primary" : "text-slate-400")} />
        <span className="hidden md:inline text-sm font-medium">统计日历</span>
      </button>
      <button 
        onClick={() => onNavigate('games')}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all", 
          currentPath === 'games' ? "bg-indigo-50 text-primary shadow-sm" : "text-slate-500 hover:bg-slate-50"
        )}
      >
        <Gamepad2 size={20} className={cn(currentPath === 'games' ? "text-primary" : "text-slate-400")} />
        <span className="hidden md:inline text-sm font-medium">解压空间</span>
      </button>
      <button 
        onClick={() => onNavigate('edit')}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all", 
          currentPath === 'edit' ? "bg-indigo-50 text-primary shadow-sm" : "text-slate-500 hover:bg-slate-50"
        )}
      >
        <Plus size={20} className={cn(currentPath === 'edit' ? "text-primary" : "text-slate-400")} />
        <span className="hidden md:inline text-sm font-medium">药箱配置</span>
      </button>
    </div>

    <div className="md:mt-auto md:pt-4 md:border-t md:border-slate-100">
      <button 
        onClick={toggleStealth}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all", 
          stealthMode ? "bg-amber-50 text-amber-600 shadow-xs" : "text-slate-400 hover:bg-slate-50"
        )}
        title={stealthMode ? "关闭隐私模式" : "开启隐身模式"}
      >
        {stealthMode ? <ShieldOff size={20} /> : <Shield size={20} />}
        <span className="hidden md:inline text-sm font-medium">{stealthMode ? '退出隐身' : '隐身模式'}</span>
      </button>
    </div>
  </nav>
);

// --- Pages ---

const HomePage = ({ medications, logs, stealthMode, onLog, prefs }: { 
  medications: Medication[], 
  logs: MedicationLog[],
  stealthMode: boolean,
  onLog: (med: Medication, status: 'taken' | 'skipped', feeling?: any) => void,
  prefs: UserPreferences
}) => {
  const today = startOfDay(new Date());
  const todayLogs = logs.filter(l => isSameDay(new Date(l.timestamp), today));
  
  const totalTasks = medications.reduce((acc, med) => acc + med.frequency, 0);
  const completedTasks = todayLogs.filter(l => l.status === 'taken').length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const tasks = medications.flatMap(med => 
    med.times.map(time => ({
      ...med,
      time,
      isCompleted: todayLogs.some(l => l.medicationId === med.id && format(new Date(l.timestamp), 'HH:mm') === time)
    }))
  ).sort((a, b) => a.time.localeCompare(b.time));

  const [feelingModal, setFeelingModal] = useState<Medication | null>(null);
  const [showKnowledge, setShowKnowledge] = useState<MedicationCategory | null>(null);
  const [takeFeedback, setTakeFeedback] = useState<string | null>(null);

  const activeDisease = (prefs.diseaseTags || []).length > 0 ? prefs.diseaseTags[0] : (medications.length > 0 ? medications[0].category : null);
  const healthTip = activeDisease && DISEASE_KNOWLEDGE[activeDisease] ? DISEASE_KNOWLEDGE[activeDisease] : null;

  const currentStreak = prefs.streakCount || 0;
  const nextAchievement = ACHIEVEMENT_TIERS.find(t => t.days > currentStreak) || ACHIEVEMENT_TIERS[ACHIEVEMENT_TIERS.length - 1];
  const achievementProgress = (currentStreak / nextAchievement.days) * 100;

  return (
    <div className="space-y-6 pb-20">
      <header className="bg-white p-6 md:p-8 border-b border-slate-200 -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-8 backdrop-blur-md bg-white/80 sticky top-0 z-50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">打卡记录</h1>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wide">
                后台运行中
              </span>
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase mt-1">您好，今天是 {format(new Date(), 'MM月dd日')}</p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* Top Rank Title */}
            {prefs.unlockedAchievements?.length > 0 && (
              <div className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                {prefs.unlockedAchievements[prefs.unlockedAchievements.length - 1].icon} {prefs.unlockedAchievements[prefs.unlockedAchievements.length - 1].name}
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">坚持天数</span>
                <span className="text-lg font-black text-indigo-600 leading-none">{prefs.streakCount} 天</span>
              </div>
              
              {/* Avatar Achievement Area with Hover */}
              <div className="relative group">
                <div className="relative w-14 h-14 flex items-center justify-center cursor-pointer">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <motion.circle 
                      cx="50" cy="50" r="45" fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="6" 
                      strokeDasharray="283" 
                      initial={{ strokeDashoffset: 283 }}
                      animate={{ strokeDashoffset: 283 - (283 * achievementProgress) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden relative shadow-inner">
                    <User size={24} className="opacity-30" />
                  </div>
                  {stealthMode && (
                    <div className="absolute top-0 -left-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm">
                      <Shield size={10} />
                    </div>
                  )}
                </div>

                {/* Hover Popover: Honor List */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60] scale-95 group-hover:scale-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2 flex items-center gap-2">
                    <Award size={14} className="text-amber-500" /> 我的荣誉殿堂
                  </h4>
                  <div className="space-y-3">
                    {prefs.unlockedAchievements?.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">尚未获得勋章，继续努力！</p>
                    ) : (
                      prefs.unlockedAchievements.map(ach => (
                        <div key={ach.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-xl">{ach.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-none">{ach.name}</p>
                            <p className="text-[8px] text-slate-400 font-medium mt-1">{format(new Date(ach.date), 'yyyy.MM.dd')} 达成</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Text Below Header Area */}
        <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100 p-3 rounded-2xl">
          <div className="p-1 px-2 bg-indigo-500 text-white rounded-lg text-[10px] font-black">{nextAchievement.icon}</div>
          <p className="text-xs font-bold text-indigo-900">
            再坚持 {nextAchievement.days - currentStreak} 天即可获得“{nextAchievement.name}”勋章
          </p>
        </div>
      </header>


      {/* Circle Progress Section */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <motion.circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke={progress === 100 ? "#10b981" : "#4f46e5"} 
                strokeWidth="10" 
                strokeDasharray="283" 
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{Math.round(progress)}%</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">达成率</span>
            </div>
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">坚持吃药进度</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              今日已完成 {completedTasks} 项，共 {totalTasks} 项任务。
            </p>
            {completedTasks === totalTasks && totalTasks > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mt-2">
                <CheckCircle2 size={12} /> 完美达成 100%
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock size={16} />
            今日任务列表
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> 上班带药
            </span>
          </div>
        </div>
        
        {tasks.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Plus size={24} />
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">暂无活跃任务</p>
            <p className="text-xs text-slate-400 mt-1">请在药品管理处添加计划</p>
          </div>
        ) : (
          <div className="grid gap-3 relative">
            <AnimatePresence>
              {takeFeedback && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9, x: "-50%" }}
                  animate={{ opacity: 1, y: -20, scale: 1, x: "-50%" }}
                  exit={{ opacity: 0, y: -40, x: "-50%" }}
                  className="absolute left-1/2 top-0 z-20 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl border border-emerald-400 whitespace-nowrap"
                >
                  {takeFeedback}
                </motion.div>
              )}
            </AnimatePresence>

            {tasks.map((task) => (
              <motion.div 
                key={`${task.id}-${task.time}`}
                className={cn(
                  "group flex items-center justify-between bg-white px-6 py-5 rounded-2xl shadow-xs border border-slate-200 transition-all hover:border-slate-300",
                  task.isCompleted && "bg-slate-50/50 border-transparent grayscale-[0.5] opacity-60"
                )}
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "flex flex-col items-center justify-center w-14 h-14 rounded-2xl border-2 font-mono transition-colors relative",
                    task.isCompleted ? "border-emerald-200 text-emerald-500" : "border-slate-100 text-slate-400 group-hover:border-primary/20 group-hover:text-primary"
                  )}>
                    {parseInt(task.time.split(':')[0]) < 12 && (
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full animate-pulse" title="上班带药提醒" />
                    )}
                    <span className="text-xs font-black">{task.time.split(':')[0]}</span>
                    <span className="text-[10px] opacity-70">{task.time.split(':')[1]}</span>
                  </div>
                  <div>
                    <h3 className={cn("font-bold text-slate-800 tracking-tight", stealthMode && "stealth-blur")}>
                      {stealthMode ? (task.stealthTitle || "常规事务提醒") : task.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">
                        {task.dosage} {task.unit}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {task.isCompleted ? (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={20} />
                      <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">已完成</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        onLog(task, 'taken');
                        const randomCheer = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];
                        setTakeFeedback(randomCheer);
                        setTimeout(() => setTakeFeedback(null), 4000);
                      }}
                      className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                      确认服药
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Health Tip Card (Moved to bottom) */}
      <AnimatePresence>
        {healthTip && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowKnowledge(activeDisease)}
            className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">今日健康建议</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight mb-2">“{healthTip.tip}”</h2>
                <div className="flex items-center gap-1 text-[10px] font-bold opacity-70 uppercase tracking-widest">
                  点击查看详细防护指南 <ChevronRight size={12} />
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Disease Knowledge Modal */}
      <AnimatePresence>
        {showKnowledge && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end justify-center p-0 z-[100]">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-lg rounded-t-[2.5rem] p-10 shadow-3xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowKnowledge(null)}
                className="absolute right-8 top-8 p-2 text-slate-300 hover:text-slate-900"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3 block">专业医学建议</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {showKnowledge === 'hypertension' ? '高血压' : 
                   showKnowledge === 'diabetes' ? '糖尿病' : 
                   showKnowledge === 'lipid' ? '高脂血症' : 
                   showKnowledge === 'coronary' ? '冠心病' : '慢阻肺'} 档案
                </h3>
              </div>

              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 pb-10">
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-500" /> 安全用药红区
                  </h4>
                  <p className="bg-rose-50 p-4 rounded-xl text-sm font-bold text-rose-700 leading-relaxed">
                    {DISEASE_KNOWLEDGE[showKnowledge].note}
                  </p>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <section className="bg-slate-50 p-5 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">推荐饮食</h4>
                    <ul className="space-y-2">
                      {DISEASE_KNOWLEDGE[showKnowledge].full.diet.map((item, i) => (
                        <li key={i} className="text-xs font-bold text-slate-600 flex gap-2">
                          <span className="text-primary">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section className="bg-slate-50 p-5 rounded-2xl">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">生活方式建议</h4>
                    <ul className="space-y-2">
                      {DISEASE_KNOWLEDGE[showKnowledge].full.lifestyle.map((item, i) => (
                        <li key={i} className="text-xs font-bold text-slate-600 flex gap-2">
                          <span className="text-emerald-500">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Warning Banner */}
      {medications.some(m => (m.remainingStock / (parseFloat(m.dosage) * m.frequency)) < 4) && (
        <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex items-center gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
          <div className="w-1 bg-amber-500 rounded-full h-12"></div>
          <div className="flex-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1">药品库存不足</h4>
            <p className="text-xs font-medium text-slate-200">部分药品库存不足 3 日，请及时补充库存并预约复诊。</p>
          </div>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0">
            补充库存
          </button>
        </section>
      )}

      {/* Feeling Modal */}
      <AnimatePresence>
        {feelingModal && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-6 z-[60] backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative border border-slate-200"
            >
              <button 
                onClick={() => setFeelingModal(null)}
                className="absolute right-6 top-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="mb-8">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 block">第 2 步：状态同步</span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">记录当前感受</h3>
                <p className="text-sm text-slate-400 mt-2">点击记录您的身体反应，以便进行依从性分析。</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 mb-8">
                {[
                  { value: 'good', label: '感觉很棒', emoji: '●', color: 'text-emerald-500 bg-emerald-50 border-emerald-100 hover:border-emerald-300' },
                  { value: 'neutral', label: '状态平和', emoji: '●', color: 'text-slate-500 bg-slate-50 border-slate-200 hover:border-slate-400' },
                  { value: 'bad', label: '有些不适', emoji: '●', color: 'text-rose-500 bg-rose-50 border-rose-100 hover:border-rose-300' },
                ].map((item) => (
                  <button 
                    key={item.value}
                    onClick={() => {
                      onLog(feelingModal, 'taken', item.value as any);
                      setFeelingModal(null);
                    }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                      item.color
                    )}
                  >
                    <span className="text-[10px] transition-transform group-hover:scale-150">{item.emoji}</span>
                    <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
                    <ArrowRight size={14} className="ml-auto opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => {
                  onLog(feelingModal, 'taken');
                  setFeelingModal(null);
                }}
                className="w-full text-center py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                跳过记录
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MedicationCalendar = ({ medications, logs, onLog, onUpdateLog, prefs, onUpdatePrefs }: { 
  medications: Medication[], 
  logs: MedicationLog[],
  onLog: (med: Medication, status: 'taken' | 'skipped', feeling?: any, customTimestamp?: number) => void,
  onUpdateLog: (logId: string, updates: Partial<MedicationLog>) => void,
  prefs: UserPreferences,
  onUpdatePrefs: (updates: Partial<UserPreferences>) => void
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTodoInput, setShowTodoInput] = useState(false);
  const [todoTitle, setTodoTitle] = useState('');
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart); // 0 (Sun) to 6 (Sat)
  
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const getDayStatus = (date: Date) => {
    if (isFuture(date) && !isToday(date)) return 'future';
    
    const dayLogs = logs.filter(l => isSameDay(new Date(l.timestamp), date));
    const totalExpected = medications.reduce((acc, m) => acc + m.frequency, 0);
    const takenCount = dayLogs.filter(l => l.status === 'taken').length;
    
    if (takenCount === 0 && dayLogs.length === 0) return 'none';
    if (takenCount >= totalExpected && totalExpected > 0) return 'perfect';
    return 'partial';
  };

  const hasFeeling = (date: Date) => {
    return logs.some(l => isSameDay(new Date(l.timestamp), date) && (l.feeling || l.note || (l.feelingTags && l.feelingTags.length > 0)));
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          打卡记录日历
        </h3>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-black text-slate-600 font-mono w-20 text-center">{format(currentMonth, 'yyyy年MM月')}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase py-2">{d}</div>
        ))}
        
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        
        {daysInMonth.map(date => {
          const status = getDayStatus(date);
          const feeling = hasFeeling(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          
          // Find achievements for this day
          const dayAchievement = (prefs.unlockedAchievements || []).find(a => isSameDay(new Date(a.date), date));
          const dayTodos = (prefs.todos || []).filter(t => isSameDay(new Date(t.date), date));

          return (
            <button 
              key={date.toString()}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "relative h-14 flex flex-col items-center justify-center rounded-xl transition-all border",
                isSelected ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-105 z-10" : "hover:bg-slate-50",
                !isSelected && status === 'perfect' && "bg-emerald-50/50 border-emerald-100 text-emerald-700",
                !isSelected && status === 'partial' && "bg-amber-50/50 border-amber-100 text-amber-700",
                !isSelected && status === 'none' && "border-slate-50",
                isFuture(date) && !isToday(date) ? "opacity-40" : ""
              )}
            >
              <span className="text-xs font-black">{format(date, 'd')}</span>
              
              <div className="flex gap-0.5 mt-1">
                {status === 'perfect' && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                {status === 'partial' && <div className="w-1 h-1 rounded-full bg-amber-400" />}
                {feeling && <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-primary")} />}
                {dayTodos.length > 0 && <div className={cn("w-1 h-1 rounded-full bg-indigo-400")} />}
              </div>
              
              {dayAchievement && (
                <div className="absolute -top-1 -right-1 text-[10px] transform rotate-12 shadow-sm bg-white rounded-full p-0.5 border border-slate-100">
                  {dayAchievement.icon}
                </div>
              )}

              {isToday(date) && !isSelected && (
                <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Status Legends */}
      <div className="mt-6 flex justify-center gap-4 border-t border-slate-50 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">100% 依从</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">部分执行</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare size={10} className="text-primary" />
          <span className="text-[10px] font-bold text-slate-400 uppercase">有记录感受</span>
        </div>
      </div>

      {/* Date Detail Modal */}
      <AnimatePresence>
        {selectedDate && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-6 z-[80] backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-200"
            >
              <button 
                onClick={() => setSelectedDate(null)}
                className="absolute right-6 top-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="mb-6">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">当日详情</span>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{format(selectedDate, 'MM月dd日')}</h3>
                  {(prefs.unlockedAchievements || []).find(a => isSameDay(new Date(a.date), selectedDate!)) && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full animate-bounce">
                      <span className="text-sm">{(prefs.unlockedAchievements || []).find(a => isSameDay(new Date(a.date), selectedDate!))?.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{(prefs.unlockedAchievements || []).find(a => isSameDay(new Date(a.date), selectedDate!))?.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-400 font-medium mt-1">执行轨迹与状态反馈。</p>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* Task List for the day */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">执行清单</h4>
                  <div className="space-y-2">
                    {medications.flatMap(med => 
                      med.times.map(time => {
                        const log = logs.find(l => 
                          isSameDay(new Date(l.timestamp), selectedDate!) && 
                          l.medicationId === med.id && 
                          format(new Date(l.timestamp), 'HH:mm') === time
                        );
                        return (
                          <div key={`${med.id}-${time}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono font-bold text-slate-400">{time}</span>
                              <span className="text-xs font-bold text-slate-700">{med.name}</span>
                            </div>
                            {log ? (
                              <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded uppercase",
                                log.status === 'taken' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                              )}>
                                {log.status === 'taken' ? '已服用' : '已跳过'}
                              </span>
                            ) : (
                              <button 
                                onClick={() => {
                                  // Create a timestamp for that day at that time
                                  const [h, m] = time.split(':').map(Number);
                                  const logDate = new Date(selectedDate!);
                                  logDate.setHours(h, m, 0, 0);
                                  onLog(med, 'taken', undefined, logDate.getTime());
                                }}
                                className="text-[10px] font-black text-primary hover:underline uppercase"
                              >
                                补登
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Feeling / Note Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">用药感受反馈</h4>
                    <button 
                      onClick={() => setShowTodoInput(true)}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      + 添加待办
                    </button>
                  </div>

                  {showTodoInput ? (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">新建事项</span>
                        <button onClick={() => setShowTodoInput(false)}><X size={12} /></button>
                      </div>
                      <input 
                        type="text"
                        placeholder="如：医院复诊、化验血糖..."
                        className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-bold outline-hidden mb-3"
                        value={todoTitle}
                        onChange={e => setTodoTitle(e.target.value)}
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                          if (todoTitle) {
                            const newTodo: CalendarTodo = {
                              id: crypto.randomUUID(),
                              date: selectedDate!.getTime(),
                              title: todoTitle,
                              type: 'medical',
                              completed: false
                            };
                            onUpdatePrefs({ todos: [...(prefs.todos || []), newTodo] });
                            setTodoTitle('');
                            setShowTodoInput(false);
                          }
                        }}
                        className="w-full bg-primary text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        保存待办
                      </button>
                    </div>
                  ) : null}

                  {/* Day Todos List */}
                  {(prefs.todos || []).filter(t => isSameDay(new Date(t.date), selectedDate!)).length > 0 && (
                    <div className="space-y-2 mb-6">
                      {prefs.todos?.filter(t => isSameDay(new Date(t.date), selectedDate!)).map(todo => (
                        <div key={todo.id} className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center cursor-pointer",
                              todo.completed ? "bg-indigo-500 border-indigo-500" : "bg-white border-slate-200"
                            )} onClick={() => {
                              const updated = prefs.todos?.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t);
                              onUpdatePrefs({ todos: updated });
                            }}>
                              {todo.completed && <Check size={10} className="text-white" />}
                            </div>
                            <span className={cn("text-xs font-bold", todo.completed ? "text-slate-400 line-through" : "text-slate-700")}>{todo.title}</span>
                          </div>
                          <button 
                            onClick={() => {
                              const updated = prefs.todos?.filter(t => t.id !== todo.id);
                              onUpdatePrefs({ todos: updated });
                            }}
                            className="text-slate-300 hover:text-rose-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {['病情好转', '恶心', '头晕', '食欲恢复', '无不适'].map(tag => {
                        // Find if any log for this day has this tag
                        const logWithTag = logs.find(l => 
                          isSameDay(new Date(l.timestamp), selectedDate!) && 
                          l.feelingTags?.includes(tag)
                        );
                        
                        return (
                          <button 
                            key={tag}
                            onClick={() => {
                              // Find first log of the day to attach tag to, or prompt
                              const firstLog = logs.find(l => isSameDay(new Date(l.timestamp), selectedDate!));
                              if (firstLog) {
                                const currentTags = firstLog.feelingTags || [];
                                const newTags = currentTags.includes(tag) 
                                  ? currentTags.filter(t => t !== tag) 
                                  : [...currentTags, tag];
                                onUpdateLog(firstLog.id, { feelingTags: newTags });
                              }
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                              logWithTag ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300"
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                    
                    <textarea 
                      placeholder="记录更多详细感受..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all min-h-[100px] resize-none"
                      value={logs.find(l => isSameDay(new Date(l.timestamp), selectedDate!))?.note || ''}
                      onChange={(e) => {
                        const firstLog = logs.find(l => isSameDay(new Date(l.timestamp), selectedDate!));
                        if (firstLog) {
                          onUpdateLog(firstLog.id, { note: e.target.value });
                        }
                      }}
                    />
                    
                    {!logs.some(l => isSameDay(new Date(l.timestamp), selectedDate!)) && (
                      <p className="text-[10px] text-slate-400 italic text-center">暂无记录，请先“补登”服药状态以开启回溯记录。</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="w-full bg-slate-900 text-white p-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/10"
                >
                  确认并保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const ReportModal = ({ logs, medications, onClose }: { logs: MedicationLog[], medications: Medication[], onClose: () => void }) => {
  const last30Days = eachDayOfInterval({
    start: addDays(new Date(), -30),
    end: new Date()
  });

  const stats = last30Days.reduce((acc, date) => {
    const dayLogs = logs.filter(l => isSameDay(new Date(l.timestamp), date));
    const totalMeds = medications.length;
    const takenCount = dayLogs.filter(l => l.status === 'taken').length;
    const skippedCount = dayLogs.filter(l => l.status === 'skipped').length;
    
    if (takenCount > 0) acc.activeDays++;
    acc.totalTaken += takenCount;
    acc.totalSkipped += skippedCount;
    
    // Collect feelings
    dayLogs.forEach(l => {
      if (l.feelingTags && l.feelingTags.length > 0) acc.feelings.push({ date, tags: l.feelingTags, note: l.note });
      else if (l.note) acc.feelings.push({ date, tags: [], note: l.note });
    });
    
    return acc;
  }, { activeDays: 0, totalTaken: 0, totalSkipped: 0, feelings: [] as {date: Date, tags: string[], note?: string}[] });

  const complianceRate = stats.totalTaken + stats.totalSkipped > 0 
    ? Math.round((stats.totalTaken / (stats.totalTaken + stats.totalSkipped)) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 z-[250]">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-3xl max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
        
        <header className="mb-10 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">复诊无忧报告 (30天)</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Report generated on {format(new Date(), 'yyyy-MM-dd')}</p>
        </header>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-50 p-6 rounded-2xl text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">坚持天数</p>
            <p className="text-2xl font-black text-slate-900">{stats.activeDays} <span className="text-xs text-slate-400">天</span></p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">依从率</p>
            <p className="text-2xl font-black text-emerald-600">{complianceRate}%</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">累计服药</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalTaken} <span className="text-xs text-slate-400">次</span></p>
          </div>
        </div>

        <section className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">副作用及身体感受摘要</h3>
          {stats.feelings.length > 0 ? (
            <div className="space-y-4">
              {stats.feelings.slice(-10).reverse().map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-[10px] font-mono text-slate-400 w-20 pt-1">{format(f.date, 'MM/dd')}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {f.tags.map(t => <span key={t} className="px-2 py-0.5 bg-indigo-50 text-primary text-[8px] font-black rounded-sm uppercase">{t}</span>)}
                    </div>
                    {f.note && <p className="text-xs text-slate-600 leading-relaxed font-medium">{f.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-4">过去30天暂无详细感受记录</p>
          )}
        </section>

        <div className="mt-12 flex gap-4">
          <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black transition-all">保存为 PDF</button>
          <button className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">分享给医生</button>
        </div>
        
        <p className="text-[8px] text-slate-300 text-center mt-8 uppercase font-bold tracking-[0.2em]">Medical Decision Support · Powered by MedyMate AI</p>
      </motion.div>
    </div>
  );
};

const PlanPage = ({ medications, logs, onLog, onUpdateLog, prefs, onUpdatePrefs }: { 
  medications: Medication[], 
  logs: MedicationLog[],
  onLog: (med: Medication, status: 'taken' | 'skipped', feeling?: any, timestamp?: number) => void,
  onUpdateLog: (logId: string, updates: Partial<MedicationLog>) => void,
  prefs: UserPreferences,
  onUpdatePrefs: (updates: Partial<UserPreferences>) => void
}) => {
  const [showReport, setShowReport] = useState(false);

  const stats = {
    compliance: medications.length > 0 ? "92%" : "N/A",
    totalTaken: logs.length,
    remainingTotal: medications.reduce((acc, m) => acc + m.remainingStock, 0)
  };

  const getHealthTip = () => {
    if (medications.some(m => m.category === 'hypertension')) {
      return { title: '血压稳定小贴士', content: '职场久坐可能导致血压波动。建议每工作 45 分钟站起来活动 3 分钟，伸展双臂。' };
    }
    if (medications.some(m => m.category === 'diabetes')) {
      return { title: '血糖管理建议', content: '午餐后建议散步 15 分钟，避免高糖下午茶，可用坚果代替奶茶。' };
    }
    return { title: '每日健康寄语', content: '保持规律的用药与充足的睡眠，是回归高效工作的基石。' };
  };

  const tip = getHealthTip();

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-center bg-white p-6 md:p-8 border-b border-slate-200 -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-8 backdrop-blur-md bg-white/80 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">用药日历</h1>
          <p className="text-slate-400 text-xs font-medium uppercase mt-1">用药依从性统计</p>
        </div>
        <button 
          onClick={() => setShowReport(true)}
          className="bg-indigo-50 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2"
        >
          <FileText size={14} />
          生成报告
        </button>
      </header>

      <AnimatePresence>
        {showReport && (
          <ReportModal logs={logs} medications={medications} onClose={() => setShowReport(false)} />
        )}
      </AnimatePresence>

      {/* Metric Tiles from theme */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">按时吃药达标率</span>
            <span className="text-primary font-bold text-xs">+2.4%</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black tracking-tight">{stats.compliance}</span>
            <span className="text-slate-400 text-xs mb-1 uppercase tracking-widest font-bold">评分</span>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">今日吃药记录</span>
            <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">Normal</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black tracking-tight">{stats.totalTaken}</span>
            <span className="text-slate-400 text-xs mb-1 uppercase tracking-widest font-bold">条记录</span>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">药品剩余量</span>
            <span className="text-amber-600 font-bold text-[10px] uppercase tracking-widest">Tracking</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black tracking-tight">{stats.remainingTotal}</span>
            <span className="text-slate-400 text-xs mb-1 uppercase tracking-widest font-bold">单位</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <MedicationCalendar 
            medications={medications} 
            logs={logs} 
            onLog={onLog} 
            onUpdateLog={onUpdateLog} 
            prefs={prefs}
            onUpdatePrefs={onUpdatePrefs}
          />
        </div>

        <section className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col h-full min-h-[300px]">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
              <FileText size={16} className="text-indigo-400" />
              智能健康贴士
            </h3>
            <div className="space-y-6 flex-1">
              <div className="flex gap-4">
                <div className="w-1 bg-indigo-500 rounded-full h-8"></div>
                <div>
                   <p className="text-xs text-white font-bold">{tip.title}</p>
                   <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{tip.content}</p>
                   <p className="text-[10px] text-indigo-400 mt-2 font-mono italic opacity-50">系统自动生成</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-white hover:bg-white/10 transition-colors uppercase">
              查看完整百科
            </button>
          </div>
        </section>
      </div>

      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-2">
          <Shield size={16} />
          我的药品仓库
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {medications.length === 0 ? (
            <div className="col-span-2 text-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs font-bold uppercase tracking-widest">系统内暂无计划节点</div>
          ) : (
            medications.map(med => {
              const daysLeft = Math.floor(med.remainingStock / med.frequency);
              const isCritical = daysLeft < 4;
              return (
                <div key={med.id} className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 group hover:border-slate-300 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-slate-800 tracking-tight">{med.name}</h4>
                    <span className={cn(
                      "text-[10px] px-2 py-1 rounded font-black uppercase tracking-widest",
                      isCritical ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700"
                    )}>
                      {isCritical ? '库存不足' : '库存充足'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div 
                      className={cn("h-full transition-all duration-1000", isCritical ? "bg-rose-500" : "bg-primary")} 
                      style={{ width: `${Math.min(100, (med.remainingStock / med.totalStock) * 100)}%` }} 
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>剩余 {med.remainingStock} 颗粒/单位</span>
                    <span>预计可用 {daysLeft} 天</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Fixed Report Button with the theme styling */}
      <div className="fixed bottom-20 left-0 right-0 px-6 py-4 pointer-events-none md:left-64 md:right-0 md:max-w-none md:px-12">
        <button 
          onClick={() => setShowReport(true)}
          className="w-full max-w-2xl mx-auto bg-slate-900 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-black/20 pointer-events-auto transform hover:scale-[1.01] active:translate-y-1 transition-all"
        >
          <FileText size={18} />
          导出用药报告
        </button>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[70]">
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden border border-slate-200"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              <button 
                onClick={() => setShowReport(false)}
                className="absolute right-8 top-8 p-2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="mb-10">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3 block">机密医学文档</span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">全景复诊报告</h2>
                <p className="text-sm text-slate-400 mt-2 font-medium">数据同步成功，报告已准备好。报告可用于就医时的辅助参考。</p>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">执行效率统计</h4>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-5xl font-black text-slate-900 tracking-tighter">92.4 <span className="text-2xl">%</span></p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">30日坚持度评分</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-700 uppercase">45/49 项任务已达成</p>
                      <p className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-black mt-2 inline-block">依从性状态：极佳</p>
                    </div>
                  </div>
                </div>

                <div className="px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">异常体征记录</h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-1 bg-amber-400 rounded-full"></div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 uppercase">监测到波动</p>
                        <p className="text-[10px] text-slate-500 font-medium">04/24 20:00 - 轻微头晕记录</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1 bg-emerald-400 rounded-full"></div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 uppercase">状态优化</p>
                        <p className="text-[10px] text-slate-500 font-medium">04/22 08:00 - 状态清爽记录</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4">
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-black p-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all" onClick={() => setShowReport(false)}>
                  导出存档
                </button>
                <button className="bg-slate-900 hover:bg-black text-white font-black p-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-black/10">
                  同步医院挂号
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditPage = ({ medications, onAdd, onDelete }: { 
  medications: Medication[], 
  onAdd: (med: Partial<Medication>) => void,
  onDelete: (id: string) => void
}) => {
  const [formData, setFormData] = useState<Partial<Medication>>({
    name: '',
    dosage: '1',
    unit: '片',
    frequency: 2,
    times: ['08:00', '20:00'],
    totalStock: 60,
    remainingStock: 60,
    category: 'other',
    stealthTitle: ''
  });

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-center bg-white p-6 md:p-8 border-b border-slate-200 -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-8 backdrop-blur-md bg-white/80 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">服药配置</h1>
          <p className="text-slate-400 text-xs font-medium uppercase mt-1">配置您的用药提醒计划</p>
        </div>
      </header>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">药品名称</label>
            <input 
              type="text" 
              placeholder="例如：阿司匹林"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all"
              value={formData.name}
              onChange={e => {
                const val = e.target.value.toLowerCase();
                let cat: MedicationCategory = formData.category || 'other';
                if (val.includes('阿司匹林') || val.includes('氨氯地平')) cat = 'hypertension';
                if (val.includes('二甲双胍') || val.includes('胰岛素')) cat = 'diabetes';
                if (val.includes('阿托伐他汀')) cat = 'lipid';
                setFormData({...formData, name: e.target.value, category: cat});
              }}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">疾病分类</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold outline-hidden cursor-pointer"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as MedicationCategory})}
            >
              <option value="other">其他 / 常规药物</option>
              <option value="hypertension">高血压</option>
              <option value="diabetes">糖尿病</option>
              <option value="lipid">高脂血症</option>
              <option value="coronary">冠心病</option>
              <option value="copd">慢阻肺 (COPD)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">单次剂量</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all"
                value={formData.dosage}
                onChange={e => setFormData({...formData, dosage: e.target.value})}
              />
              <select 
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-hidden cursor-pointer"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
              >
                <option>片</option>
                <option>mg</option>
                <option>ml</option>
                <option>粒</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">当前剩余总量</label>
            <input 
              type="number" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-hidden transition-all"
              value={formData.remainingStock}
              onChange={e => setFormData({...formData, remainingStock: parseInt(e.target.value) || 0, totalStock: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex justify-between">
            服药时间计划
            <span className="text-primary hover:underline cursor-pointer transition-all flex items-center gap-1" onClick={() => setFormData({...formData, times: [...(formData.times || []), '12:00']})}>
              <Plus size={12} /> 添加时间段
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {formData.times?.map((time, idx) => (
              <div key={idx} className="bg-slate-100 px-4 py-3 rounded-xl flex items-center gap-3 border border-slate-200 group">
                <input 
                  type="time" 
                  value={time} 
                  className="bg-transparent border-0 p-0 text-sm font-black outline-hidden cursor-pointer"
                  onChange={e => {
                    const newTimes = [...(formData.times || [])];
                    newTimes[idx] = e.target.value;
                    setFormData({...formData, times: newTimes, frequency: newTimes.length});
                  }}
                />
                <button 
                  className="p-1 hover:bg-rose-50 rounded-lg transition-colors"
                  onClick={() => {
                    const newTimes = (formData.times || []).filter((_, i) => i !== idx);
                    setFormData({...formData, times: newTimes, frequency: newTimes.length});
                  }}
                >
                  <X size={14} className="text-slate-400 hover:text-rose-500" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-amber-500" />
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">隐身标题（职场伪装）</label>
          </div>
          <input 
            type="text" 
            placeholder="例如：系统自动备份、喝水提醒"
            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden transition-all"
            value={formData.stealthTitle}
            onChange={e => setFormData({...formData, stealthTitle: e.target.value})}
          />
          <p className="text-[10px] text-slate-400 font-medium italic opacity-70">开启隐身模式后，通知提醒将替换为此标题。</p>
        </div>

        <button 
          onClick={() => {
            if (!formData.name) return alert('请输入药品名称');
            onAdd(formData);
            setFormData({
              name: '',
              dosage: '1',
              unit: '片',
              frequency: 2,
              times: ['08:00', '20:00'],
              totalStock: 60,
              remainingStock: 60,
              category: 'other',
              stealthTitle: ''
            });
          }}
          className="w-full bg-primary hover:bg-primary-dark text-white p-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.01] active:translate-y-1 shadow-xl shadow-primary/20"
        >
          保存并开启计划
        </button>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 mb-4">已开启的用药计划 ({medications.length})</h3>
        <div className="grid gap-3">
          {medications.map(med => (
            <div key={med.id} className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex justify-between items-center group transition-colors hover:border-slate-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 border border-slate-100">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 tracking-tight">{med.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{med.frequency} SEC/DAY · VOL: {med.dosage}{med.unit}</p>
                </div>
              </div>
              <button 
                onClick={() => onDelete(med.id)}
                className="text-slate-300 hover:text-rose-500 p-2 transition-all hover:scale-110"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const CHEER_MESSAGES = [
  "又是充满活力的一天，别忘了带上你的‘健康外挂’哦！🚀",
  "第 3 天达成！你离‘控糖大师’的称号又近了一步 🚀",
  "棒极了！您的自律正在为您打造最强的健康防线。🛡️",
  "完成！就像给血管做了个 SPA，感觉舒畅多了吧？✨",
  "哇哦！这种坚持的精神简直比咖啡还提神！☕",
  "第 7 天！‘自律小能手’勋章已在向您招手。👋",
  "不错！每一次吞咽都是对未来的负责。🌱",
  "完成打卡！您的心脏正在为您疯狂点赞。❤️",
  "小提示：记得餐后 30 分钟走走，消化更好哦！🚶",
  "太棒了！您离达成当月满分成就只剩一步之遥。🏆"
];

const ACHIEVEMENT_TIERS = [
  { id: 'streak-3', name: '健康守护者', days: 3, icon: '🛡️' },
  { id: 'streak-7', name: '自律小能手', days: 7, icon: '🥈' },
  { id: 'streak-21', name: '古希腊掌管吃药的神', days: 21, icon: '🥇' }
];

const WelcomeModal = ({ onComplete }: { onComplete: (disease: MedicationCategory) => void }) => {
  const [step, setStep] = useState(0);
  const [selectedDisease, setSelectedDisease] = useState<MedicationCategory>('other');

  const steps = [
    {
      title: "欢迎来到「慢病用药小管家」",
      subtitle: "聪明管药，让自律变得更简单、更有趣。",
      icon: <Sparkles className="text-primary" size={48} />,
      content: "聪明管药，让自律变得更简单、更有趣。请让我们为您介绍核心功能。"
    },
    {
      title: "职场隐形，准时打卡",
      subtitle: "职场隐形提醒，更体面更安心。",
      icon: <Shield className="text-amber-500" size={48} />,
      content: "每日按时推送，支持自定义「隐私标题」。你的药事，只有你知道。即便在会议中，也能从容完成健康目标。"
    },
    {
      title: "专病锦囊，生活有道",
      subtitle: "专病深度干预，不只是吃药。",
      icon: <Zap className="text-indigo-500" size={48} />,
      content: "选择您的健康类型，获得针对性的饮食、运动与生活贴士。我们懂药品，更懂如何管理好您的身体。"
    },
    {
      title: "荣誉挑战，解锁乐趣",
      subtitle: "告别枯燥坚持，赢取荣誉头衔。",
      icon: <Award className="text-emerald-500" size={48} />,
      content: "坚持服药即刻变身“自律达人”，解锁勋章与专属小游戏。让健康管理像通关一样充满成就感。"
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[200]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-3xl relative overflow-hidden"
      >
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <motion.div
              key={step}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center"
            >
              {steps[step].icon}
            </motion.div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{steps[step].title}</h3>
            <p className="text-primary font-bold text-sm mb-4 uppercase tracking-wider">{steps[step].subtitle}</p>
            <p className="text-slate-400 text-sm leading-relaxed">{steps[step].content}</p>
          </div>
        </div>

        {step === 3 && (
          <div className="mb-8">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">最后，选择您主要关注的健康管理领域</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'hypertension', label: '高血压' },
                { id: 'diabetes', label: '糖尿病' },
                { id: 'lipid', label: '高脂血症' },
                { id: 'other', label: '其他/通用' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDisease(d.id as MedicationCategory)}
                  className={cn(
                    "p-3 rounded-xl border-2 font-bold text-xs transition-all",
                    selectedDisease === d.id ? "bg-primary border-primary text-white" : "bg-slate-50 border-transparent text-slate-600 hover:border-slate-200"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              继续 <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              onClick={() => onComplete(selectedDisease)}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              立即开启我的健康守护
            </button>
          )}
          
          <div className="flex justify-center gap-1.5 mt-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={cn("w-2 h-2 rounded-full transition-all", step === i ? "w-6 bg-primary" : "bg-slate-200")} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const GameSpace = ({ streak }: { streak: number }) => {
  const games = [
    { id: 'block', name: '舒压消消乐', minStreak: 3, icon: '🧊', color: 'bg-emerald-500' },
    { id: 'merge', name: '健康 2048', minStreak: 7, icon: '🧩', color: 'bg-amber-500' },
    { id: 'run', name: '快跑！小药瓶', minStreak: 15, icon: '🏃', color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-center bg-white p-6 md:p-8 border-b border-slate-200 -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-8 backdrop-blur-md bg-white/80 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">解压空间</h1>
          <p className="text-slate-400 text-xs font-medium uppercase mt-1">坚持打卡，解锁专属乐趣</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
          <Zap size={16} className="text-indigo-600" />
          <span className="text-sm font-black text-indigo-900">{streak} 天连击</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => {
          const isLocked = streak < game.minStreak;
          return (
            <motion.div
              key={game.id}
              whileHover={!isLocked ? { scale: 1.02, y: -5 } : {}}
              className={cn(
                "relative h-64 rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden transition-all duration-500",
                isLocked ? "bg-slate-100 border-2 border-dashed border-slate-300 opacity-60" : `${game.color} shadow-2xl`
              )}
            >
              {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 backdrop-blur-[2px] z-10">
                  <Shield size={48} className="text-slate-400 mb-4" />
                  <p className="text-slate-500 font-black text-xs uppercase tracking-widest">
                    连击需达到 {game.minStreak} 天解锁
                  </p>
                </div>
              )}
              
              <div className="relative z-0">
                <span className="text-6xl mb-4 block transform group-hover:rotate-12 transition-transform">{game.icon}</span>
                <h3 className={cn("text-2xl font-black tracking-tight", isLocked ? "text-slate-400" : "text-white")}>
                  {game.name}
                </h3>
              </div>

              {!isLocked ? (
                <button className="w-full bg-white/20 backdrop-blur-md text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/30 hover:bg-white hover:text-slate-900 transition-all">
                  进入游戏
                </button>
              ) : (
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-400" 
                    style={{ width: `${(streak / game.minStreak) * 100}%` }} 
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 backdrop-blur-3xl animate-pulse" />
        <div className="relative z-10">
          <Sparkles className="text-amber-400 mb-4" size={32} />
          <h2 className="text-2xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white">
            坚持的力量，值得被奖励。
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            我们的解压空间会随着您的健康程度逐渐丰富。坚持每一天，不仅是为了一个更好的身体，也是为了那一份小确幸。
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'plan' | 'edit' | 'games'>('home');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>(storage.getPrefs());
  const [showWelcome, setShowWelcome] = useState(true);
  const [stealthMode, setStealthMode] = useState(prefs.stealthMode);

  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);

  const calculateStreak = (allLogs: MedicationLog[]) => {
    if (medications.length === 0) return 0;
    
    let currentStreak = 0;
    let checkDate = startOfDay(new Date());
    
    // Make sure we include today if all tasks are done, or start from yesterday
    const todayLogs = allLogs.filter(l => isSameDay(new Date(l.timestamp), checkDate) && l.status === 'taken');
    const totalExpected = medications.reduce((acc, m) => acc + m.frequency, 0);
    
    if (todayLogs.length < totalExpected) {
      checkDate = addDays(checkDate, -1);
    }
    
    while (true) {
      const dayLogs = allLogs.filter(l => isSameDay(new Date(l.timestamp), checkDate) && l.status === 'taken');
      const dailyTasksNeeded = medications.reduce((acc, m) => acc + m.frequency, 0);
      
      if (dayLogs.length >= dailyTasksNeeded && dailyTasksNeeded > 0) {
        currentStreak++;
        checkDate = addDays(checkDate, -1);
      } else {
        break;
      }
    }
    return currentStreak;
  };

  useEffect(() => {
    const meds = storage.getMedications();
    const lgs = storage.getLogs();
    setMedications(meds);
    setLogs(lgs);
    
    // Explicitly reset streak count as requested
    const resetPrefs = { ...storage.getPrefs(), streakCount: 0 };
    setPrefs(resetPrefs);
    storage.savePrefs(resetPrefs);
    
    // Auth-style redirect to edit if no meds
    if (meds.length === 0) {
      setCurrentPage('edit');
    }
  }, []);

  const [activeReminder, setActiveReminder] = useState<{ type: 'med', med: Medication; time: string } | { type: 'todo', todo: CalendarTodo; message: string } | null>(null);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTimeStr = format(now, 'HH:mm');
      const today = startOfDay(now);

      // 1. Medication Reminders
      medications.forEach((med) => {
        med.times.forEach((scheduledTime) => {
          if (scheduledTime === currentTimeStr) {
            const alreadyLogged = logs.some(
              (l) =>
                isSameDay(new Date(l.timestamp), today) &&
                l.medicationId === med.id &&
                format(new Date(l.timestamp), 'HH:mm') === scheduledTime
            );

            if (!alreadyLogged && activeReminder?.type !== 'med') {
              setActiveReminder({ type: 'med', med, time: scheduledTime });
            }
          }
        });
      });

      // 2. Todo Reminders
      const todos = prefs.todos || [];
      const tomorrow = addDays(today, 1);
      
      todos.forEach(todo => {
        const todoDate = startOfDay(new Date(todo.date));
        
        // T-1 Reminder at 20:00
        if (isSameDay(todoDate, tomorrow) && currentTimeStr === '20:00') {
          if (activeReminder?.type !== 'todo' || (activeReminder.type === 'todo' && activeReminder.todo.id !== todo.id)) {
            setActiveReminder({ type: 'todo', todo, message: `明天有“${todo.title}”计划，请提前准备！` });
          }
        }
        
        // T Reminder at 08:00
        if (isSameDay(todoDate, today) && currentTimeStr === '08:00' && !todo.completed) {
          if (activeReminder?.type !== 'todo' || (activeReminder.type === 'todo' && activeReminder.todo.id !== todo.id)) {
            setActiveReminder({ type: 'todo', todo, message: `今日提醒：别忘了“${todo.title}”哦。` });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 15000); // Check every 15s to be more responsive
    checkReminders();
    return () => clearInterval(interval);
  }, [medications, logs, activeReminder]);

  const handleLog = (med: Medication, status: 'taken' | 'skipped', feeling?: any, customTimestamp?: number) => {
    const timestamp = customTimestamp || Date.now();
    const newLog: MedicationLog = {
      id: crypto.randomUUID(),
      medicationId: med.id,
      timestamp,
      status,
      feeling
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    storage.saveLogs(updatedLogs);

    // Update stock only for "taken" and if it's current date or user confirmed
    if (status === 'taken' && (!customTimestamp || isSameDay(timestamp, Date.now()))) {
      const updatedMeds = medications.map(m => 
        m.id === med.id 
          ? { ...m, remainingStock: Math.max(0, m.remainingStock - parseFloat(m.dosage)), updatedAt: Date.now() }
          : m
      );
      setMedications(updatedMeds);
      storage.saveMedications(updatedMeds);

      // Calculate streak and check for milestones
      const currentStreak = calculateStreak(updatedLogs);
      const tier = ACHIEVEMENT_TIERS.find(t => t.days === currentStreak && !(prefs.unlockedAchievements || []).some(a => a.id === t.id));
      
      let newAchievements = [...(prefs.unlockedAchievements || [])];
      if (tier) {
        const newAchievement = { id: tier.id, name: tier.name, icon: tier.icon, date: Date.now() };
        newAchievements.push(newAchievement);
        setActiveAchievement(newAchievement);
      }

      const newPrefs: UserPreferences = {
        ...prefs,
        streakCount: currentStreak,
        unlockedAchievements: newAchievements
      };
      setPrefs(newPrefs);
      storage.savePrefs(newPrefs);
    }
  };

  const handleUpdatePrefs = (updates: Partial<UserPreferences>) => {
    const newPrefs = { ...prefs, ...updates };
    setPrefs(newPrefs);
    storage.savePrefs(newPrefs);
  };

  const handleUpdateLog = (logId: string, updates: Partial<MedicationLog>) => {
    const updatedLogs = logs.map(l => l.id === logId ? { ...l, ...updates } : l);
    setLogs(updatedLogs);
    storage.saveLogs(updatedLogs);
  };

  const handleAddMed = (partial: Partial<Medication>) => {
    const newMed: Medication = {
      ...partial,
      id: crypto.randomUUID(),
      updatedAt: Date.now(),
    } as Medication;
    const updated = [...medications, newMed];
    setMedications(updated);
    storage.saveMedications(updated);

    // Suggest adding disease tag
    const currentTags = prefs.diseaseTags || [];
    if (newMed.category !== 'other' && !currentTags.includes(newMed.category)) {
      const newPrefs: UserPreferences = {
        ...prefs,
        diseaseTags: [...currentTags, newMed.category]
      };
      setPrefs(newPrefs);
      storage.savePrefs(newPrefs);
    }

    setCurrentPage('home');
  };

  const handleDeleteMed = (id: string) => {
    const updated = medications.filter(m => m.id !== id);
    setMedications(updated);
    storage.saveMedications(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 md:pl-64">
      <Navbar 
        currentPath={currentPage} 
        onNavigate={setCurrentPage} 
        stealthMode={prefs.stealthMode}
        toggleStealth={() => {
          const newPrefs = { ...prefs, stealthMode: !prefs.stealthMode };
          setPrefs(newPrefs);
          storage.savePrefs(newPrefs);
        }}
      />
      
      <main className="p-6 md:p-12 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <HomePage medications={medications} logs={logs} stealthMode={prefs.stealthMode} onLog={handleLog} prefs={prefs} />
            </motion.div>
          )}
          {currentPage === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <PlanPage medications={medications} logs={logs} onLog={handleLog} onUpdateLog={handleUpdateLog} prefs={prefs} onUpdatePrefs={handleUpdatePrefs} />
            </motion.div>
          )}
          {currentPage === 'edit' && (
            <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <EditPage medications={medications} onAdd={handleAddMed} onDelete={handleDeleteMed} />
            </motion.div>
          )}
          {currentPage === 'games' && (
            <motion.div key="games" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <GameSpace streak={prefs.streakCount || 0} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeModal 
            onComplete={(disease) => {
              const updates: Partial<UserPreferences> = {
                diseaseTags: disease !== 'other' ? [disease] : []
              };
              handleUpdatePrefs(updates);
              setShowWelcome(false);
            }} 
          />
        )}
      </AnimatePresence>

      {/* Real-time Reminder Modal */}
      <AnimatePresence>
        {activeReminder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, rotateX: -20 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotateX: 20 }}
              className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative border border-slate-200 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }} 
                    className="absolute inset-0 bg-amber-500/20 rounded-full" 
                  />
                  {activeReminder.type === 'med' ? <Clock className="text-amber-600 relative z-10" size={28} /> : <AlertCircle className="text-amber-600 relative z-10" size={28} />}
                </div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-2 block">
                  {activeReminder.type === 'med' ? '温馨提醒 / TIME TO TAKE' : '日程提醒 / SCHEDULE'}
                </span>
                <h3 className={cn("text-2xl font-black text-slate-900 tracking-tight", prefs.stealthMode && activeReminder.type === 'med' && "stealth-blur")}>
                  {activeReminder.type === 'med' 
                    ? (prefs.stealthMode ? (activeReminder.med.stealthTitle || "常规事务提醒") : activeReminder.med.name)
                    : activeReminder.todo.title}
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest leading-relaxed">
                  {activeReminder.type === 'med' ? `${activeReminder.time} · ${activeReminder.med.dosage}${activeReminder.med.unit}` : activeReminder.message}
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    if (activeReminder.type === 'med') {
                      handleLog(activeReminder.med, 'taken');
                    } else {
                      const updatedTodos = (prefs.todos || []).map(t => t.id === activeReminder.todo.id ? { ...t, completed: true } : t);
                      handleUpdatePrefs({ todos: updatedTodos });
                    }
                    setActiveReminder(null);
                  }}
                  className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-black transition-all"
                >
                  {activeReminder.type === 'med' ? '确认服药' : '确认收到'}
                </button>
                <button 
                  onClick={() => setActiveReminder(null)}
                  className="w-full bg-slate-100 text-slate-400 p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  稍后记录
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Achievement Unlocked Modal */}
      <AnimatePresence>
        {activeAchievement && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 z-[200]">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white p-10 rounded-[3rem] text-center max-w-xs w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="text-6xl mb-6 transform hover:scale-110 transition-transform cursor-default">
                  {activeAchievement.icon}
                </div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 block">New Achievement / 获得新勋章</span>
                <h4 className="text-3xl font-black text-slate-900 mb-2">{activeAchievement.name}</h4>
                <p className="text-sm text-slate-400 font-medium mb-8">坚持是通往健康的唯一径捷。继续保持！</p>
                <button 
                  onClick={() => setActiveAchievement(null)}
                  className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200"
                >
                  太棒了，继续坚持
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
