import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, Clock, User, Package, Star, MessageSquare } from 'lucide-react';
import type { Event } from '../../../types/event';
import { EventTypeBadge } from '../shared/EventTypeBadge';
import { EventStatusBadge } from '../shared/EventStatusBadge';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface EventDetailProps {
  event: Event;
}

export function EventDetail({ event }: EventDetailProps) {
  const regCount = event.registraties?.length ?? 0;
  const fbCount = event.feedback?.length ?? 0;
  const avgScore = event.feedback?.length
    ? (
        event.feedback
          .map((f) => ((f.schaal_1 ?? 0) + (f.schaal_2 ?? 0) + (f.schaal_3 ?? 0)) / 3)
          .reduce((a, b) => a + b, 0) / event.feedback.length
      ).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex flex-wrap gap-2 items-center">
        <EventTypeBadge type={event.type} showIcon />
        <EventStatusBadge status={event.status} />
        {event.is_published && (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold uppercase tracking-wide"
          >
            Gepubliceerd
          </Badge>
        )}
      </div>

      <h2 className="text-xl font-black text-[#041c3a] leading-tight">{event.titel}</h2>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        {event.event_datum && (
          <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
            <Calendar className="w-4 h-4 text-[#ed6425] flex-shrink-0" />
            <span className="font-medium">
              {format(new Date(event.event_datum), 'd MMMM yyyy', { locale: nl })}
            </span>
          </div>
        )}
        {event.locatie && (
          <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
            <MapPin className="w-4 h-4 text-[#ed6425] flex-shrink-0" />
            <span className="font-medium">{event.locatie}</span>
          </div>
        )}
        {event.start_tijd && (
          <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
            <Clock className="w-4 h-4 text-[#ed6425] flex-shrink-0" />
            <span className="font-medium">
              {event.deuren_open && `Deuren: ${event.deuren_open} · `}
              {event.start_tijd} – {event.einde_tijd}
            </span>
          </div>
        )}
        {event.max_deelnemers && (
          <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
            <Users className="w-4 h-4 text-[#ed6425] flex-shrink-0" />
            <span className="font-medium">Max. {event.max_deelnemers} deelnemers</span>
          </div>
        )}
      </div>

      {/* Stats for compleet events */}
      {event.status === 'compleet' && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-[#041c3a] rounded-xl text-center">
            <p className="text-3xl font-black text-white">{regCount}</p>
            <p className="text-xs text-white/70 font-semibold uppercase tracking-wide mt-1">
              Inschrijvingen
            </p>
          </div>
          <div className="p-4 bg-[#ed6425] rounded-xl text-center">
            <p className="text-3xl font-black text-white">{fbCount}</p>
            <p className="text-xs text-white/70 font-semibold uppercase tracking-wide mt-1">
              Feedback
            </p>
          </div>
          {avgScore && (
            <div className="p-4 bg-amber-400 rounded-xl text-center">
              <p className="text-3xl font-black text-white flex items-center justify-center gap-1">
                <Star className="w-5 h-5" />
                {avgScore}
              </p>
              <p className="text-xs text-white/70 font-semibold uppercase tracking-wide mt-1">
                Gem. score
              </p>
            </div>
          )}
        </div>
      )}

      {/* Descriptions */}
      {event.beschrijving_website && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#041c3a]">
              Beschrijving website
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-slate-600 leading-relaxed">{event.beschrijving_website}</p>
          </CardContent>
        </Card>
      )}

      {event.beschrijving_sociaal && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#041c3a]">
              Sociale media tekst
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-slate-600 leading-relaxed">{event.beschrijving_sociaal}</p>
          </CardContent>
        </Card>
      )}

      {/* Sprekers */}
      {event.sprekers && event.sprekers.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 border-b border-slate-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#041c3a] flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#ed6425]" />
              Sprekers ({event.sprekers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {event.sprekers
              .sort((a, b) => a.volgorde - b.volgorde)
              .map((spreker) => (
                <div
                  key={spreker.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#041c3a] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[#041c3a]">{spreker.naam}</p>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize bg-[#ed6425]/10 text-[#ed6425] border-[#ed6425]/20 font-semibold"
                      >
                        {spreker.rol}
                      </Badge>
                    </div>
                    {spreker.email && (
                      <p className="text-xs text-slate-500 mt-0.5">{spreker.email}</p>
                    )}
                    {spreker.omschrijving && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {spreker.omschrijving}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Materiaal */}
      {event.materiaal && event.materiaal.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 border-b border-slate-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#041c3a] flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-[#ed6425]" />
              Materiaal ({event.materiaal.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {event.materiaal.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#041c3a]">{item.item}</p>
                    {item.leverancier && (
                      <p className="text-xs text-slate-500">{item.leverancier}</p>
                    )}
                  </div>
                  {item.hoeveelheid && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-[#041c3a]/10 text-[#041c3a] font-semibold"
                    >
                      {item.hoeveelheid}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback summary */}
      {event.status === 'compleet' && event.feedback && event.feedback.length > 0 && (() => {
        const fb = event.feedback;
        const avg = (key: 'schaal_1' | 'schaal_2' | 'schaal_3') => {
          const vals = fb.map(f => f[key]).filter(Boolean) as number[];
          return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
        };
        const avg1 = avg('schaal_1');
        const avg2 = avg('schaal_2');
        const avg3 = avg('schaal_3');

        const ScoreBar = ({ score, max = 5 }: { score: number; max?: number }) => (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#041c3a] to-[#ed6425] rounded-full transition-all"
                style={{ width: `${(score / max) * 100}%` }}
              />
            </div>
            <span className="text-sm font-black text-[#041c3a] w-8 text-right">{score}</span>
          </div>
        );

        return (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#041c3a] flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#ed6425]" />
                Feedback — {fb.length} {fb.length === 1 ? 'respons' : 'responses'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">

              {/* Gemiddelde scores */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Gemiddelde scores (op 5)</p>
                {[
                  { label: 'Organisatie', value: avg1 },
                  { label: 'Locatie & faciliteiten', value: avg2 },
                  { label: 'Inhoud', value: avg3 },
                ].map(({ label, value }) => value && (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600 w-36 flex-shrink-0">{label}</span>
                    <ScoreBar score={parseFloat(value)} />
                  </div>
                ))}
              </div>

              <Separator />

              {/* Kwalitatieve antwoorden */}
              {['wat_kon_beter', 'favo_onderdeel', 'andere_opmerkingen'].some(
                key => fb.some(f => f[key as keyof typeof f])
              ) && (
                <div className="space-y-4">
                  {[
                    { key: 'wat_kon_beter', label: 'Wat kon beter?' },
                    { key: 'favo_onderdeel', label: 'Favoriet onderdeel' },
                    { key: 'andere_opmerkingen', label: 'Andere opmerkingen' },
                  ].map(({ key, label }) => {
                    const answers = fb
                      .map(f => f[key as keyof typeof f] as string)
                      .filter(Boolean);
                    if (!answers.length) return null;
                    return (
                      <div key={key}>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{label}</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {answers.map((ans, i) => (
                            <div key={i} className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 leading-relaxed">
                              {ans}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}