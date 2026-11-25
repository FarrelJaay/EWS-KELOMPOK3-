import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface AlertItem {
  id: number;
  level: 'Warning' | 'Info';
  title: string;
  time: string;
  statusTag: string;
}

export interface CitizenReportItem {
  id: number;
  title: string;
  location: string;
  hazardType: 'Erupsi' | 'Lahar' | 'Kekeringan';
  aiVerified: boolean;
  imageLabel: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('LUMAJANG-RESILIENT');

  // Status kebencanaan sesuai konsep laporan PBL
  generalAlertStatus: 'NORMAL' | 'WASPADA' | 'SIAGA' | 'AWAS' = 'NORMAL';
  droughtAlertStatus: 'Normal' | 'Waspada' | 'Kritis' = 'Waspada';
  isEmergencyTriggered = false;

  // Kontrol peta & panel simulasi operator
  selectedMapLayer: 'SEMUA' | 'ERUPSI_LAHAR' | 'KEKERINGAN' | 'EVAKUASI' = 'SEMUA';
  selectedEventType = 'Erupsi';
  selectedOperatorRole = 'Operator Posko / BPBD';
  simulationMode = 'Kekeringan';

  // Form laporan warga cepat
  newReportLocation = '';
  newReportHazard: 'Erupsi' | 'Lahar' | 'Kekeringan' = 'Lahar';
  newReportNotes = '';

  // Chatbot AI Disaster Assistant
  isChatbotOpen = true;
  chatInput = '';
  chatMessages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'Halo! Saya AI Disaster Assistant LUMAJANG-RESILIENT. Tanyakan info jalur evakuasi, status DAS Besuk Kobokan, atau titik tangki air bersih.',
    },
  ];

  activeAlerts: AlertItem[] = [
    {
      id: 1,
      level: 'Warning',
      title: 'Potensi Lahar Dingin (DAS Besuk Kobokan)',
      time: 'Hari ini • Pemantauan Curah Hujan Hulu',
      statusTag: 'Pantau',
    },
    {
      id: 2,
      level: 'Info',
      title: 'Penyaluran Air Bersih Wilayah Terdampak Kekeringan',
      time: 'Update Posko • Kec. Candipuro & Pasrujambe',
      statusTag: 'Aktif',
    },
  ];

  crowdReports: CitizenReportItem[] = [
    {
      id: 101,
      title: 'Aliran Keruh & Debit Meningkat di Hulu',
      location: 'Area DAS Besuk Kobokan, Lumajang',
      hazardType: 'Lahar',
      aiVerified: true,
      imageLabel: 'Foto Lapangan Lahar / Sungai',
    },
    {
      id: 102,
      title: 'Sumur Warga Menurun Drastis',
      location: 'Kec. Candipuro, Kab. Lumajang',
      hazardType: 'Kekeringan',
      aiVerified: true,
      imageLabel: 'Foto Kondisi Sumber Air',
    },
  ];

  triggerEmergencyAlert(): void {
    this.isEmergencyTriggered = !this.isEmergencyTriggered;
    if (this.isEmergencyTriggered) {
      this.generalAlertStatus = 'AWAS';
      this.activeAlerts.unshift({
        id: Date.now(),
        level: 'Warning',
        title: `DARURAT (${this.selectedEventType.toUpperCase()}) - Siaran Peringatan Dipicu`,
        time: 'Baru saja • Automated Emergency Broadcast',
        statusTag: 'AWAS',
      });
    } else {
      this.generalAlertStatus = 'NORMAL';
    }
  }

  broadcastAlert(alert: AlertItem): void {
    alert.statusTag = 'Terkirim';
  }

  submitCrowdReport(): void {
    if (!this.newReportLocation.trim()) return;

    this.crowdReports.unshift({
      id: Date.now(),
      title: this.newReportNotes.trim() || `Laporan Kejadian ${this.newReportHazard}`,
      location: this.newReportLocation.trim(),
      hazardType: this.newReportHazard,
      aiVerified: true,
      imageLabel: `Lampiran ${this.newReportHazard}`,
    });

    this.newReportLocation = '';
    this.newReportNotes = '';
  }

  sendChatMessage(customQuestion?: string): void {
    const question = (customQuestion ?? this.chatInput).trim();
    if (!question) return;

    this.chatMessages.push({ sender: 'user', text: question });

    let reply =
      'Untuk informasi darurat resmi di Kabupaten Lumajang, pastikan selalu mengikuti arahan Posko BPBD setempat dan jalur evakuasi yang telah ditetapkan.';

    const lower = question.toLowerCase();
    if (lower.includes('evakuasi') || lower.includes('lahar') || lower.includes('semeru')) {
      reply =
        'Jika terjadi peningkatan aktivitas Semeru atau banjir lahar di DAS Besuk Kobokan, segera jauhi aliran sungai/lembah dan menuju posko evakuasi aman terdekat.';
    } else if (lower.includes('air') || lower.includes('kekeringan')) {
      reply =
        'Pantau titik distribusi tangki air bersih pada layer Kekeringan di peta utama dan cek pembaruan penyaluran air di panel Active Alerts.';
    }

    this.chatMessages.push({ sender: 'bot', text: reply });
    if (!customQuestion) {
      this.chatInput = '';
    }
  }
}
