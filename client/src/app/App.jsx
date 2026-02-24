import { useState } from "react";
import { AuthProvider, useAuth } from "../lib/auth.jsx";
import { SafetyControl } from "../features/safety/SafetyControl.jsx";
import { StatusBar } from "../components/StatusBar.jsx";
import { Notification } from "../components/Notification.jsx";
import { ProfileScreen } from "../features/profile/ProfileScreen.jsx";
import { PhoneHomeScreen } from "../features/home/PhoneHomeScreen.jsx";
import { LandingScreen } from "../features/landing/LandingScreen.jsx";
import { DashboardScreen } from "../features/dashboard/DashboardScreen.jsx";
import { OnboardingScreen } from "../features/onboarding/OnboardingScreen.jsx";
import { MatchingScreen } from "../features/matching/MatchingScreen.jsx";
import { ChatScreen } from "../features/chat/ChatScreen.jsx";
import { SuccessScreen } from "../features/matching/SuccessScreen.jsx";
import { CalendarScreen } from "../features/calendar/CalendarScreen.jsx";
import { FeedScreen } from "../features/feed/FeedScreen.jsx";
import { LibraryScreen } from "../features/library/LibraryScreen.jsx";
import { RewardsScreen } from "../features/rewards/RewardsScreen.jsx";
import { AiAssistantScreen } from "../features/ai/AiAssistantScreen.jsx";
import { MessagesScreen } from "../features/messages/MessagesScreen.jsx";
import { Calendar, Gift, Users } from "lucide-react";

function AppInner() {
  const { loading, joining, user, signup, signin, signout } = useAuth();

  const [screen, setScreen] = useState("home_screen");
  const [animate, setAnimate] = useState(false);
  const [selectedStrong, setSelectedStrong] = useState([]);
  const [selectedWeak, setSelectedWeak] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);
  const [redeemedItem, setRedeemedItem] = useState(null);

  const [showNotification, setShowNotification] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  const handleSignout = () => {
    signout();
    setScreen("home_screen");
    setShowProfile(false);
    setSelectedStrong([]);
    setSelectedWeak([]);
    setSelectedInterests([]);
    setShowNotification(false);
    setAnimate(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-200">
        <div className="w-full max-w-[340px] h-[640px] bg-white rounded-[2.5rem] border-[8px] border-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-black mb-2">
              <span className="text-blue-600">Help</span>
              <span className="text-green-600">IN</span>
            </div>
            <div className="text-slate-400 text-sm animate-pulse">טוען...</div>
          </div>
        </div>
      </div>
    );
  }

  const handleTransition = (nextScreen) => {
    setShowNotification(false);
    setAnimate(true);
    setTimeout(() => {
      setScreen(nextScreen);
      setAnimate(false);
    }, 300);
  };

  const handleStart = async (profile) => {
    if (!user) {
      try {
        if (profile.mode === "signin") {
          await signin({ name: profile.name, school: profile.school, pin: profile.pin });
        } else {
          await signup(profile);
        }
      } catch (error) {
        console.error("Auth failed", error);
        return;
      }
    }
    handleTransition("dashboard");
  };

  const toggleSelection = (item, type) => {
    if (type === "strong") {
      setSelectedStrong((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    } else if (type === "weak") {
      setSelectedWeak((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    } else if (type === "interest") {
      setSelectedInterests((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    }
  };

  const openChat = (student) => {
    setChatPartner(student);
    handleTransition("chat");
  };

  const handleSuccess = (nextScreen, student) => {
    if (student) setChatPartner(student);
    handleTransition(nextScreen);
    const partnerName = student?.name || "חבר";
    setTimeout(() => {
      setNotificationData({
        title: "לוח שנה",
        message: `נקבע שיעור עם ${partnerName} ביום ג' ב-16:00 🗓️`,
        icon: Calendar,
        color: "bg-red-500",
        type: "calendar",
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    }, 1000);
  };

  const handlePurchase = (item, code) => {
    const newItem = { ...item, code };
    setRedeemedItem(newItem);
    setNotificationData({
      title: "איזה כיף! 🎉",
      message: `רכשת ${item.name}! לחץ לצפייה בקופון`,
      icon: Gift,
      color: "bg-purple-500",
      type: "reward",
    });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const isTeaching = selectedWeak.length === 0 && selectedStrong.length > 0;
  const isDarkStatusBar = screen !== "home_screen";
  const handleReport = () => setIsSafetyOpen(true);

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-slate-200 font-sans p-4"
      dir="rtl"
    >
      <div className="w-full max-w-[340px] h-[640px] bg-white shadow-2xl overflow-hidden relative rounded-[2.5rem] border-[8px] border-slate-900 ring-1 ring-slate-900/50">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-6 bg-slate-900 rounded-b-xl z-50"></div>

        <StatusBar isDarkText={isDarkStatusBar && screen !== "calendar"} />

        <SafetyControl isOpen={isSafetyOpen} onClose={() => setIsSafetyOpen(false)} />

        <Notification
          show={showNotification}
          data={notificationData}
          onClick={() => {
            if (notificationData?.type === "calendar") {
              handleTransition("calendar");
            } else if (notificationData?.type === "reward") {
              handleTransition("messages");
            } else {
              setShowNotification(false);
            }
          }}
        />

        <div
          className={`h-full w-full transition-opacity duration-300 ${
            animate ? "opacity-0" : "opacity-100"
          } relative`}
        >
          {showProfile && <ProfileScreen onClose={() => setShowProfile(false)} onSignout={handleSignout} />}

          {screen === "home_screen" && (
            <PhoneHomeScreen
              onLaunchApp={() => handleTransition("landing")}
              onOpenMessages={() => handleTransition("messages")}
            />
          )}
          {screen === "landing" && (
            <LandingScreen onStart={handleStart} isStarting={joining} />
          )}
          {screen === "dashboard" && (
            <DashboardScreen
              onNavigate={handleTransition}
              onOpenProfile={() => setShowProfile(true)}
              onReport={handleReport}
            />
          )}
          {screen === "onboarding" && (
            <OnboardingScreen
              toggleSelection={toggleSelection}
              selectedStrong={selectedStrong}
              selectedWeak={selectedWeak}
              selectedInterests={selectedInterests}
              onNext={handleTransition}
              onOpenProfile={() => setShowProfile(true)}
              onReport={handleReport}
            />
          )}
          {screen === "matching" && (
            <MatchingScreen
              selectedWeak={selectedWeak}
              selectedStrong={selectedStrong}
              selectedInterests={selectedInterests}
              onBack={handleTransition}
              onChat={openChat}
              onSuccess={handleSuccess}
              onOpenProfile={() => setShowProfile(true)}
              onReport={handleReport}
            />
          )}
          {screen === "chat" && (
            <ChatScreen
              partner={chatPartner}
              onBack={handleTransition}
              subject={isTeaching ? selectedStrong[0] : selectedWeak[0] || "היסטוריה"}
              isTeaching={isTeaching}
              onReport={handleReport}
            />
          )}
          {screen === "success" && (
            <SuccessScreen partner={chatPartner} onHome={handleTransition} />
          )}
          {screen === "calendar" && (
            <CalendarScreen
              partner={chatPartner}
              onBack={handleTransition}
              onReport={handleReport}
            />
          )}
          {screen === "feed" && (
            <FeedScreen
              onBack={handleTransition}
              onOpenProfile={() => setShowProfile(true)}
              onReport={handleReport}
            />
          )}
          {screen === "library" && (
            <LibraryScreen
              onBack={handleTransition}
              onOpenProfile={() => setShowProfile(true)}
              onReport={handleReport}
            />
          )}
          {screen === "rewards" && (
            <RewardsScreen
              onBack={handleTransition}
              onPurchase={handlePurchase}
              onOpenProfile={() => setShowProfile(true)}
              onReport={handleReport}
            />
          )}
          {screen === "ai_assistant" && (
            <AiAssistantScreen onBack={handleTransition} onReport={handleReport} />
          )}
          {screen === "messages" && (
            <MessagesScreen
              onBack={handleTransition}
              redeemedItem={redeemedItem}
              onReport={handleReport}
            />
          )}
        </div>

        {/* Home bar */}
        <div
          onClick={() => handleTransition("home_screen")}
          className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-900/20 rounded-full z-50 cursor-pointer hover:bg-slate-900/40 transition-colors"
        ></div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
