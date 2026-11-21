/* Made-up records for the founders' demo (Simulator → demo data). Never mixed with the live records.
   No real phone numbers or prices; every name here is invented. */
const DAY = 86400000;
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const pick = (a) => a[Math.floor(rnd() * a.length)];

export function sampleData() {
  seed = 7;
  const now = Date.now();
  const staff = [
    { id: 's1', name: 'আরিফ হোসেন', role: 'owner', created: now - 200 * DAY },
    { id: 's2', name: 'নাদিয়া রহমান', role: 'ops', created: now - 120 * DAY },
    { id: 's3', name: 'তানভীর আহমেদ', role: 'sales', created: now - 90 * DAY }
  ];
  const usage = (good) => ({
    attendanceDays: good ? 22 + Math.floor(rnd() * 3) : 6 + Math.floor(rnd() * 8), schoolDays: 24,
    resultsPublished: good ? 3 : 1, checksDone: good ? 80 + Math.floor(rnd() * 20) : 20 + Math.floor(rnd() * 30),
    parentsTotal: 0, parentsActive: 0, lastActive: now - (good ? rnd() * DAY : (3 + rnd() * 6) * DAY)
  });
  const inst = (o) => ({ id: 'i' + o.code, classes: ['Play', 'KG', '১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি'], district: 'ব্রাহ্মণবাড়িয়া', eiin: '', plan: '', notes: [], ...o });
  const institutions = [
    inst({ name: 'কসবা আইডিয়াল প্রি-ক্যাডেট একাডেমি', code: 'KSB', type: 'kindergarten', upazila: 'কসবা', contactName: 'প্রধান শিক্ষক (নমুনা)', students: 180, stage: 'live', started: now - 75 * DAY, created: now - 110 * DAY, usage: usage(true) }),
    inst({ name: 'সবুজ কুঁড়ি কিন্ডারগার্টেন', code: 'SKK', type: 'kindergarten', upazila: 'কসবা', contactName: 'অধ্যক্ষ (নমুনা)', students: 95, stage: 'pilot', started: now - 18 * DAY, created: now - 40 * DAY, usage: usage(true) }),
    inst({ name: 'নবারুণ মডেল স্কুল', code: 'NMS', type: 'school', upazila: 'আখাউড়া', contactName: 'প্রধান শিক্ষক (নমুনা)', students: 240, stage: 'live', started: now - 50 * DAY, created: now - 80 * DAY, usage: usage(false) }),
    inst({ name: 'আল-হেরা নূরানী মাদ্রাসা', code: 'AHM', type: 'madrasa', upazila: 'নবীনগর', contactName: 'মুহতামিম (নমুনা)', students: 130, stage: 'demo', created: now - 9 * DAY }),
    inst({ name: 'নবীনগর সিটি কলেজ', code: 'NCC', type: 'college', upazila: 'নবীনগর', contactName: 'অধ্যক্ষ (নমুনা)', students: 600, stage: 'lead', classes: ['একাদশ', 'দ্বাদশ'], created: now - 4 * DAY }),
    inst({ name: 'আলোর পাঠশালা', code: 'APS', type: 'kindergarten', upazila: 'ব্রাহ্মণবাড়িয়া সদর', contactName: 'পরিচালক (নমুনা)', students: 60, stage: 'paused', created: now - 150 * DAY, started: now - 140 * DAY, usage: usage(false) })
  ];
  institutions.forEach((i) => { if (i.usage) { i.usage.parentsTotal = i.students; i.usage.parentsActive = Math.round(i.students * (i.usage.checksDone / 100) * 0.9); } });

  const upazilas = ['কসবা', 'কসবা', 'আখাউড়া', 'ব্রাহ্মণবাড়িয়া সদর', 'নবীনগর', 'সরাইল', 'বাঞ্ছারামপুর'];
  const sources = ['Website', 'Website', 'Landing page', 'Field visit', 'Referral', 'Facebook'];
  const kinds = [
    ['diary', () => 'স্মার্ট ডায়েরি চায় • ' + (80 + Math.floor(rnd() * 300)) + ' শিক্ষার্থী'],
    ['khata', () => 'স্কুল খাতা ' + pick([200, 300, 500, 1000]) + ' পিস • ' + pick([40, 60, 80]) + ' পাতা'],
    ['a4', () => 'A4 কাগজ ' + pick([10, 25, 50]) + ' রিম • ' + pick([70, 75, 80]) + ' GSM'],
    ['ring', () => 'রিং খাতা ' + pick([3, 5, 10]) + ' পিস']
  ];
  const orgs = ['আদর্শ শিশু নিকেতন', 'মুক্তি কিন্ডারগার্টেন', 'রূপসী বাংলা স্কুল', 'জ্ঞানের আলো একাডেমি', 'শাপলা প্রি-ক্যাডেট', 'স্বপ্নসিঁড়ি স্কুল', 'বর্ণমালা কিন্ডারগার্টেন', 'কসবা ট্রেডার্স', 'নূর লাইব্রেরি', 'সততা স্টোর'];
  const people = ['রহিম উদ্দিন', 'সালমা বেগম', 'জাহিদ হাসান', 'ফারজানা আক্তার', 'মো. কামাল', 'রুমানা ইসলাম', 'সাইফুল আলম', 'নাসরিন সুলতানা'];
  const statuses = ['new', 'new', 'contacted', 'contacted', 'demo', 'won', 'lost'];
  const leads = [];
  for (let i = 0; i < 34; i++) {
    const [kind, sum] = pick(kinds), age = Math.floor(rnd() * 60);
    let status = age < 2 ? 'new' : pick(statuses);
    if (kind !== 'diary' && status === 'demo') status = 'contacted';
    leads.push({ id: 'l' + i, kind, name: pick(people), org: pick(orgs), upazila: pick(upazilas), source: pick(sources), status, summary: sum(),
      owner: pick(['s2', 's3', '']), created: now - age * DAY - rnd() * DAY, notes: status === 'new' ? [] : [{ at: now - Math.max(0, age - 1) * DAY, by: 'তানভীর আহমেদ', text: 'ফোনে কথা হয়েছে; আগ্রহী।' }] });
  }
  const pages = [
    { id: 'p1', slug: 'kasba-schools', title: 'কসবার স্কুলের জন্য স্মার্ট ডায়েরি', lang: 'bn', kind: 'diary', status: 'live', created: now - 30 * DAY,
      headline: 'খাতা আর ডায়েরি, এক জায়গায়', sub: 'হাজিরা, বাড়ির কাজ, ফলাফল ও মাসিক অগ্রগতি: অভিভাবক ফোনেই দেখেন।',
      points: ['স্কুল কোড, শ্রেণি আর রোল দিয়ে অভিভাবকের লগইন', 'প্রতিটি বিষয়ে ন্যূনতম মান: প্রথম হওয়া নয়, শেখা', 'স্কুলের নিজের লোগো ও রঙে সব প্রিন্ট'], cta: 'ডেমো দেখতে চাই', views: 412 },
    { id: 'p2', slug: 'akhaura-khata', title: 'আখাউড়ার স্কুলের নিজস্ব খাতা', lang: 'bn', kind: 'khata', status: 'draft', created: now - 3 * DAY,
      headline: 'স্কুলের নাম ও লোগোসহ খাতা', sub: 'প্লে থেকে পঞ্চম শ্রেণি: দাগ, বক্স ও ৪-দাগ খাতা।', points: ['স্কুলের নিজের মলাট', 'শ্রেণি অনুযায়ী দাগ'], cta: 'দাম জানতে চাই', views: 0 }
  ];
  const tickets = [
    { id: 't1', inst: 'iNMS', subject: 'শিক্ষকেরা নম্বর দিতে পারছেন না', kind: 'problem', status: 'open', owner: 's2', created: now - 1.2 * DAY, notes: [] },
    { id: 't2', inst: 'iKSB', subject: 'নতুন শিক্ষক যোগ করতে চান', kind: 'request', status: 'waiting', owner: 's2', created: now - 4 * DAY, notes: [{ at: now - 3 * DAY, by: 'নাদিয়া রহমান', text: 'প্রধান শিক্ষকের কাছে নাম ও বিষয় চেয়েছি।' }] },
    { id: 't3', inst: 'iSKK', subject: 'অভিভাবকদের জন্য প্রশিক্ষণ সভা', kind: 'training', status: 'done', owner: 's3', created: now - 12 * DAY, notes: [] }
  ];
  return { staff, leads, institutions, pages, tickets, activity: [] };
}
