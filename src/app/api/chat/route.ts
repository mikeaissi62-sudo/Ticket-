import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { messages, message } = await request.json();

    const userMessage = message || (Array.isArray(messages) && messages[messages.length - 1]?.content);

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return NextResponse.json(
        { error: 'Le message est requis.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Gemini non configurée.' },
        { status: 500 }
      );
    }

    // 1. Récupérer les informations réelles depuis Supabase pour enrichir le contexte
    let contextCompanies = 'Confort Lines, Baobab Express, ATT Transports, STM Voyageurs';
    let contextRoutes = 'Cotonou - Parakou, Cotonou - Bohicon, Cotonou - Natitingou, Parakou - Djougou';

    try {
      const supabase = createAdminClient();
      const [companiesRes, routesRes] = await Promise.all([
        supabase.from('companies').select('name, rating, is_official_partner').eq('is_active', true),
        supabase.from('routes').select(`
          base_price,
          duration_minutes,
          departure_station:stations!routes_departure_station_id_fkey(name, city),
          arrival_station:stations!routes_arrival_station_id_fkey(name, city),
          company:companies!inner(name)
        `).limit(25)
      ]);

      if (companiesRes.data && companiesRes.data.length > 0) {
        contextCompanies = (companiesRes.data as any[])
          .map((c: any) => `${c.name} (Note: ${c.rating || 4.5}/5${c.is_official_partner ? ' - Partenaire Officiel' : ''})`)
          .join(', ');
      }

      if (routesRes.data && routesRes.data.length > 0) {
        contextRoutes = routesRes.data
          .map((r: any) => {
            const dep = r.departure_station?.city || r.departure_station?.name || 'Départ';
            const arr = r.arrival_station?.city || r.arrival_station?.name || 'Arrivée';
            const comp = r.company?.name || 'Compagnie';
            const price = r.base_price ? `${r.base_price} FCFA` : '';
            return `${dep} -> ${arr} via ${comp} (${price})`;
          })
          .slice(0, 15)
          .join('; ');
      }
    } catch (dbErr) {
      console.warn('Could not fetch context from Supabase, using defaults:', dbErr);
    }

    // 2. Construire le prompt système avec l'identité de Ticket+
    const systemPrompt = `Tu es l'assistant virtuel intelligent de Ticket+, la première plateforme de réservation de billets de bus interurbains au Bénin.
Ton rôle est d'accueillir chaleureusement les voyageurs, de les aider à trouver les meilleurs trajets, les horaires, les tarifs, et de répondre à toutes leurs questions sur Ticket+.

Contexte officiel Ticket+ :
- Pays : Bénin (villes principales : Cotonou, Parakou, Bohicon, Natitingou, Porto-Novo, Abomey, Djougou, Tanguiéta, etc.).
- Monnaie : Franc CFA (FCFA / XOF).
- Compagnies partenaires vérifiées : ${contextCompanies}.
- Trajets populaires disponibles : ${contextRoutes}.
- Moyens de paiement acceptés : MTN Mobile Money (MoMo), Moov Money, Carte bancaire (Visa / Mastercard).
- Avantages Ticket+ : Réservation 100% en ligne, choix de la place dans le bus, e-billet instantané par QR Code / WhatsApp / Email / SMS, pas de file d'attente en gare.
- Comment réserver : Depuis la page d'accueil ou de recherche, choisir la ville de départ, la ville d'arrivée, la date et le nombre de passagers, puis sélectionner le voyage et payer.

Directives de réponse :
- Réponds en français clair, poli, professionnel et convivial (tu peux utiliser des emojis adaptés comme 🚌, ✨, 🎫, 📍).
- Sois concis et direct.
- Si le voyageur cherche un trajet spécifique (ex: Cotonou - Parakou), donne-lui des exemples de tarifs et de compagnies disponibles et invite-le à utiliser la barre de recherche.
- Ne jamais inventer de fausses compagnies ou de fausses fonctionnalités inexistantes.
- En cas de problème ou de réclamation, invite le client à contacter le support Ticket+ via la page Contact ou WhatsApp.`;

    // 3. Préparer l'historique de conversation
    const historyParts: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    if (Array.isArray(messages)) {
      for (const m of messages.slice(-6, -1)) {
        if (m.role === 'user' || m.role === 'assistant') {
          historyParts.push({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          });
        }
      }
    }

    const ai = new GoogleGenAI({ apiKey });

    // Modèles avec fallback pour garantir 100% de disponibilité
    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest'
    ];

    let generatedText = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const fullPrompt = `${systemPrompt}\n\nHistorique récent :\n${historyParts.map(h => `${h.role === 'user' ? 'Voyageur' : 'Assistant'}: ${h.parts[0]?.text}`).join('\n')}\n\nVoyageur : ${userMessage}\nAssistant :`;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
        });

        if (response.text) {
          generatedText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or unavailable:`, err?.message || err);
        lastError = err;
      }
    }

    if (!generatedText) {
      throw lastError || new Error('Aucun modèle Gemini n\'a pu répondre.');
    }

    return NextResponse.json({
      reply: generatedText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json(
      {
        error: 'Une erreur est survenue lors de la communication avec l\'assistant.',
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
