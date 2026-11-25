/**
 * Unit tests for the Number Theoretic Transform. The pinned values (between the PINNED markers)
 * were computed by the Python implementation (number_theoretic_transform.py), and the FFT rows by
 * the Fast Fourier Transform topic's Python code; the rest checks the constants and the roots,
 * the bit-reversal order, the transform against the direct O(n^2) sum, the round trip, the
 * products against schoolbook multiplication modulo p on random inputs with fixed seeds, the
 * edge cases, the length limit and the number of butterflies.
 */
#include <cassert>
#include <cstdint>
#include <iostream>
#include <random>
#include <stdexcept>
#include <vector>

#include "number_theoretic_transform.cpp"

namespace {

struct Transform {
    std::vector<long long> a;
    bool inverse;
    std::vector<long long> want;
};

struct Product {
    std::vector<long long> p, q, want;
};

// PINNED (generated from Python)
const std::vector<uint64_t> PINNED_ROOTS = {1, 998244352, 911660635, 372528824, 929031873, 452798380, 922799308, 781712469, 476477967, 166035806, 258648936, 584193783, 63912897, 350007156, 666702199, 968855178, 629671588, 24514907, 996173970, 363395222, 565042129, 733596141, 267099868, 15311432};
const std::vector<uint64_t> PINNED_INVERSE_ROOTS = {1, 998244352, 86583718, 509520358, 337190230, 87557064, 609441965, 135236158, 304459705, 685443576, 381598368, 335559352, 129292727, 358024708, 814576206, 708402881, 283043518, 3707709, 121392023, 704923114, 950391366, 428961804, 382752275, 469870224};
const std::vector<Transform> PINNED_TRANSFORMS = {
    {{1, 2, 3, 4}, false, {10, 173167434, 998244351, 825076915}},
    {{10, 173167434, 998244351, 825076915}, true, {1, 2, 3, 4}},
    {{1, 2, 3}, false, {6, 825076915, 2, 173167434}},
    {{1, 0, 0, 0}, false, {1, 1, 1, 1}},
    {{0, 1, 0, 0, 0, 0, 0, 0}, false, {1, 372528824, 911660635, 488723995, 998244352, 625715529, 86583718, 509520358}},
    {{-1, -2, 998244353, 1996488711}, false, {2, 606086025, 998244349, 392158326}},
    {{7}, false, {7}},
    {{7}, true, {7}},
    {{}, false, {}},
    {{3, 1, 4, 1, 5, 9, 2, 6}, true, {124780548, 493639351, 531591071, 531554847, 374341632, 48774684, 965775459, 922519823}},
    {{998244352, 998244352, 998244352, 998244352, 998244352, 998244352, 998244352, 998244352}, false, {998244345, 0, 0, 0, 0, 0, 0, 0}},
    {{0, 0, 0, 0, 0}, false, {0, 0, 0, 0, 0, 0, 0, 0}},
};
const std::vector<Product> PINNED_PRODUCTS = {
    {{1, 2, 3}, {4, 5}, {4, 13, 22, 15}},
    {{1, 2}, {3, 4}, {3, 10, 8}},
    {{1, 1}, {1, 1}, {1, 2, 1}},
    {{1, -1}, {1, 1}, {1, 0, 998244352}},
    {{7}, {3}, {21}},
    {{0, 0, 0}, {1, 2}, {0, 0, 0, 0}},
    {{998244352}, {998244352}, {1}},
    {{998244351}, {998244351}, {4}},
    {{1000000000}, {1000000000}, {716070898}},
    {{998244352, 998244352, 998244352}, {998244352, 998244352, 998244352}, {1, 2, 3, 2, 1}},
    {{}, {}, {}},
    {{}, {5}, {}},
    {{}, {1, 2, 3}, {0, 0}},
    {{73000000, 11000000, 53000000}, {37000000, 55000000, 53000000}, {341870250, 124700719, 457102099, 53946344, 285319180}},
    {{513482241851432LL, 557199649404724LL, -689701562258158LL}, {364763986864415LL}, {156006877, 84448884, 128875157}},
    {{174701753, 815803213, 470640171, 455859625, 833829477, 899428560, 610471983, 264447564}, {81388382, 858196394, 778173936, 1123901, 626550836, 603134581, 951969108, 62045706}, {916651899, 832067120, 429623631, 441636299, 667283230, 149483799, 894564796, 813945941, 845529887, 814209156, 534825870, 802066329, 458002598, 950730472, 837359908}},
    {{979156541679976LL, 703667613893372LL, 586358980894622LL}, {-206285851882509LL, -435600109478680LL, -829665580346804LL, -427942445020383LL, 450607288908882LL, 13260797753979LL, 671083937592369LL, -486853100743645LL}, {352794116, 650642188, 873166640, 625092310, 430654423, 599353972, 246947503, 250861814, 263700075, 239135680}},
    {{289004029, 390657148, 864538194, 617952312, 150146627}, {541327917, 359936350, 32530654, 323450359, 47207602}, {943451058, 477157716, 658284736, 363893636, 586583963, 274262273, 698422387, 14208579, 229740070}},
    {{-360281933104120LL, 754870022943244LL, 762759662579485LL}, {78682762227350LL}, {494196999, 817980251, 942126180}},
    {{704637986, 459193484, 225091906, 339916553, 928792743, 206260116, 854608285}, {912847783, 193568233, 132650460, 214236412, 893025944, 906448526, 527615366, 688754812, 426478591}, {385822421, 678063864, 556649344, 202311026, 109036391, 626292097, 708587969, 697665422, 857230401, 511381131, 870316510, 988583453, 500280800, 974432622, 44917544}},
    {{-624858587909436LL, 337229028354794LL, -29200234426278LL, 98954951743336LL}, {38652410700522LL, 87369893335831LL}, {18974628, 542150971, 615315614, 873521339, 447911107}},
    {{36320684, 935265360, 527482364, 230738303, 598122500, 390693723, 531014839}, {178309328, 720494734}, {878116134, 584655623, 481798612, 625649100, 921150137, 193591092, 853552329, 461262751}},
    {{539242430756195LL, -921289038790496LL, 906335246847371LL}, {-132745586536775LL, 430909158859669LL, 313015851672238LL, -981187660813596LL, -687313112203782LL, 233376486334631LL, -460890229956315LL, 711349850751952LL}, {757221103, 29215698, 688933757, 414991597, 736912126, 439384644, 128968789, 186780687, 954943416, 113918192}},
    {{551177836, 81716027, 219121933, 36740516, 472221573, 952475305, 67030181}, {6561412, 361956802, 500243925, 305405517, 727125939, 508275223, 418886757, 209415858, 864903441}, {339333087, 446949034, 289428629, 871147792, 377376547, 186772332, 102467489, 56873613, 217599509, 170783204, 433265469, 647076486, 973401103, 506194104, 199290433}},
    {{20991970444228LL, -535631256742840LL, -366907363457300LL, -951900667204255LL, 842160254225272LL, 543366462523492LL, -239483713961979LL}, {-125284477795740LL, 480130163700642LL, 673611396219667LL, -683697655508843LL}, {994699434, 993844095, 512343970, 263917616, 864636231, 654611430, 938703486, 662214793, 465030825, 490408959}},
    {{231507137, 830864154, 594059364, 435643507}, {154275223, 65444942, 679601191, 615934497}, {829434514, 32018172, 782116316, 865270033, 636669583, 470892526, 884474286}},
    {{-195468315661711LL, -24545784019289LL, -167766406366615LL, 954487550195733LL}, {-323306502316523LL}, {965422977, 771146116, 406860615, 949784718}},
    {{325818962, 567542074, 604230884, 293853575}, {216746068, 777254679}, {700725876, 626352197, 307121796, 800203049, 475763498}},
    {{824443358826364LL, -963870148853021LL}, {601324362029902LL, -30027934100713LL, 13810040812156LL}, {625757153, 893652148, 119171121, 722995485}},
    {{573587572}, {141281530, 542547358, 619958790, 289998521, 421859741}, {924769404, 238161615, 316741288, 679915830, 766542789}},
    {{-604741747369652LL, 786949188932010LL, 873430402139226LL, -610643453278240LL, -5904588595574LL, 885361222525853LL, 849188393193697LL}, {660443720146350LL, -204725263692897LL, 191824790298502LL, 850022492444012LL, 332869435078501LL, -359271623409558LL, 237183531719723LL, -921348037105415LL, 41339814652080LL}, {918700673, 443692569, 577022316, 474654469, 659989942, 550728961, 633313831, 108300239, 633681773, 298267730, 869649503, 657398709, 652851035, 95846390, 233451123}},
    {{368322989, 516169477, 802198376, 797778220, 136245428, 366495498, 934682512, 525195632}, {720075302, 63520599, 542100936, 623026679, 322356841, 697648189}, {663982811, 536197593, 319254825, 815013363, 778826516, 613807822, 758512615, 179034175, 574137579, 747146396, 950444302, 88557012, 69067143}},
    {{561161330685558LL, -237790892568510LL}, {352184196199134LL, 48753880501449LL, -218047573024277LL, -96307595178489LL, 803634358074074LL}, {463271876, 237362374, 408293636, 155062808, 54882733, 131230827}},
    {{302330696, 535377421, 396462355, 761594805, 724797114, 12134759, 458499163, 658126815, 196131074}, {454475734, 87228243, 361775209, 805836267}, {580341710, 127852899, 449665414, 390063422, 663415113, 141280782, 536789872, 843836775, 824674553, 772138248, 443793404, 713497611}},
    {{-151622543371402LL, -360987701046680LL, -303841604324896LL, 223155893585713LL, -434933962775571LL, 178435900333415LL}, {406475852417071LL, 296993992964483LL, -81164085438696LL, 383469254772566LL, -913230935519589LL}, {586144805, 983691262, 522243724, 380219087, 64911760, 832705488, 507649231, 772522072, 25711778, 614007157}},
    {{277564327, 756218367, 747648320, 107955822, 718110841, 255227885, 520907610, 163317339}, {863904942, 947623215, 984661421, 771892976, 539118975, 741229112, 703527867, 660696401}, {397513627, 833698739, 295926894, 186193198, 635373996, 265437882, 679682562, 42601899, 913729861, 83924139, 472749953, 507611046, 604608915, 235020732, 163341236}},
    {{613277454321906LL, -461008086099971LL, -524709423975339LL, -271340092054833LL, -641009489150330LL, 889061558871558LL, -70510677658615LL}, {750521991026093LL, -877959284975695LL, -924096986043693LL, -295147002604563LL, -877826529827058LL}, {324927204, 879223753, 468802819, 165236346, 742930299, 867523275, 958513018, 573001631, 615464277, 70985791, 28644256}},
    {{641114443, 317530724, 137130721, 192735965, 377198006, 230282397, 286307268, 346699250}, {735316872, 162570296, 908877884, 997301091, 909983553}, {527035627, 82613879, 382167671, 386369007, 251885880, 333028063, 776725121, 422648622, 339110264, 395501050, 382311615, 634505163}},
    {{-199842024119384LL, -232457200881645LL, -356750177991080LL, 729477470160864LL, 807039610893557LL, -912422583357510LL, 67646151328347LL}, {523922588557045LL, -455189444893458LL}, {879173462, 923280464, 113576170, 891430077, 456254321, 121964818, 320885887, 696314171}},
    {{705080892, 225993636, 294341330, 797280795, 288935180, 621293535, 729747639, 376945911}, {408790588, 417277739, 824641819, 67288018, 363768375, 291653894, 752602613, 648481951}, {295826887, 205566888, 765890337, 344539641, 319503443, 924986949, 277794273, 378859774, 730916307, 881612495, 477955567, 269209173, 489459560, 362389375, 507673624}},
};
// The Fast Fourier Transform topic's multiply_polynomials (Python), rounded and exact here.
const std::vector<Product> PINNED_FFT_PRODUCTS = {
    {{1, 2, 3}, {4, 5}, {4, 13, 22, 15}},
    {{1, 2}, {3, 4}, {3, 10, 8}},
    {{99, 99, 99}, {99, -99, 99, -99, 99}, {9801, 0, 9801, -9801, 9801, 0, 9801}},
    {{3, -1, 4, 1}, {5, 9, -2, 6}, {15, 22, 5, 61, -5, 22, 6}},
    {{1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000}, {1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000}, {1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000, 11000000, 12000000, 13000000, 14000000, 15000000, 16000000, 15000000, 14000000, 13000000, 12000000, 11000000, 10000000, 9000000, 8000000, 7000000, 6000000, 5000000, 4000000, 3000000, 2000000, 1000000}},
    {{0}, {5, 5}, {0, 0}},
    {{-99, 0, 0, 0, 0, 0, 0, 99}, {1}, {-99, 0, 0, 0, 0, 0, 0, 99}},
    {{941, -692, -192, 333, -902, -852}, {-808, -252, 193, -882, 863, 39, -561, -924, -824}, {-760328, 322004, 511133, -1184198, 2030271, 588836, -973673, 429747, -42239, -209651, 323310, 1037028, 1530496, 702048}},
    {{-144, -857, -508, -815, 128, -131, -879}, {-747, 940, -543, 291, 284, 193, 940, -874, 181, 199}, {107568, 504819, -347912, 554732, -876155, 241714, -218229, -1727107, 563667, -774170, 295220, -653266, -850783, 770007, -185168, -174921}},
    {{-899, 999, -548, -905, 140, 758, -728}, {-142, -705, 107, -759, 169}, {127658, 491937, -722672, 1304084, -350663, 281592, 178249, 335141, -629558, 680654, -123032}},
    {{147, 671, 396, -630, -789}, {169, 308, -616, -238, -801, 121, 458, -872, 155, -878}, {24843, 158675, 183040, -432824, -848762, -468864, 467285, 919462, 174800, -754382, -339760, 242670, 430845, 692742}},
    {{-579, 16, 393, 88, -125, 591, -357, -47, 199, 891}, {-260, -387, -492, 626, -632, 431, 597, -501}, {150540, 219913, 176496, -545297, 181032, -162224, -606452, 194755, 855592, -1080775, -110515, -22509, -97479, -326545, 526371, 432228, -446391}},
};
// END PINNED

/** The definition, X[k] = sum_j a[j] w^(jk) mod MOD, in O(n^2); the inverse divides by n. */
std::vector<long long> directTransform(const std::vector<long long>& a, bool inverse) {
    size_t n = a.size();
    uint64_t w = rootOfUnity(n, inverse);
    std::vector<long long> out(n);
    for (size_t k = 0; k < n; k++) {
        uint64_t sum = 0, wk = powMod(w, k), power = 1;  // power = w^(jk)
        for (size_t j = 0; j < n; j++) {
            sum = (sum + mulMod(reduce(a[j]), power)) % MOD;
            power = mulMod(power, wk);
        }
        out[k] = static_cast<long long>(sum);
    }
    if (inverse) {
        uint64_t nInverse = powMod(n, MOD - 2);
        for (long long& x : out) x = static_cast<long long>(mulMod(x, nInverse));
    }
    return out;
}

/** The product modulo MOD in O(len(p) * len(q)), with the same lengths as multiplyPolynomials. */
std::vector<long long> schoolbookMod(const std::vector<long long>& p, const std::vector<long long>& q) {
    size_t need = p.size() + q.size();
    std::vector<long long> out(need > 0 ? need - 1 : 0, 0);
    if (p.empty() || q.empty()) return out;
    for (size_t i = 0; i < p.size(); i++) {
        for (size_t j = 0; j < q.size(); j++) {
            out[i + j] = static_cast<long long>((out[i + j] + mulMod(reduce(p[i]), reduce(q[j]))) % MOD);
        }
    }
    return out;
}

std::vector<long long> randomResidues(std::mt19937_64& rng, size_t n) {
    std::vector<long long> v(n);
    for (long long& x : v) x = static_cast<long long>(rng() % MOD);
    return v;
}

std::vector<long long> randomSigned(std::mt19937_64& rng, size_t n, long long bound) {
    std::uniform_int_distribution<long long> d(-bound, bound);
    std::vector<long long> v(n);
    for (long long& x : v) x = d(rng);
    return v;
}

size_t nextPowerOfTwo(size_t n) {
    size_t size = 1;
    while (size < n) size <<= 1;
    return size;
}

template <class F>
bool throwsInvalid(F f) {
    try {
        f();
    } catch (const std::invalid_argument&) {
        return true;
    }
    return false;
}

}  // namespace

void testConstants() {
    assert(MOD == 119ULL * (1ULL << 23) + 1);
    for (uint64_t d = 2; d * d <= MOD; d++) assert(MOD % d != 0);
    assert(MOD - 1 == (1ULL << 23) * 7 * 17);
    for (uint64_t q : {2ULL, 7ULL, 17ULL}) assert(powMod(PRIMITIVE_ROOT, (MOD - 1) / q) != 1);
    assert(MAX_LENGTH == (size_t(1) << 23));
    assert((MOD - 1) % MAX_LENGTH == 0 && (MOD - 1) % (2 * MAX_LENGTH) != 0);
    // The largest product of two residues: (MOD - 1)^2 = 996491786299899904 < 2^63.
    assert((MOD - 1) * (MOD - 1) == 996491786299899904ULL);
    assert(mulMod(MOD - 1, MOD - 1) == 1);
    assert(mulMod(MOD - 2, MOD - 2) == 4);
}

void testRoots() {
    for (int k = 0; k < 24; k++) {
        size_t n = size_t(1) << k;
        uint64_t w = rootOfUnity(n);
        assert(w == PINNED_ROOTS[k]);
        assert(rootOfUnity(n, true) == PINNED_INVERSE_ROOTS[k]);
        assert(powMod(w, n) == 1);
        if (n >= 2) assert(powMod(w, n / 2) == MOD - 1);  // order exactly n
        assert(mulMod(w, rootOfUnity(n, true)) == 1);
        if (k >= 1) assert(mulMod(w, w) == rootOfUnity(n / 2));
    }
    assert(rootOfUnity(4) == 911660635 && mulMod(911660635, 911660635) == MOD - 1);
    for (size_t bad : {size_t(0), size_t(3), size_t(6), size_t(1) << 24}) {
        assert(throwsInvalid([bad] { rootOfUnity(bad); }));
    }
}

void testBitReversal() {
    std::vector<long long> a = {0, 1, 2, 3, 4, 5, 6, 7};
    bitReversePermute(a);
    assert((a == std::vector<long long>{0, 4, 2, 6, 1, 5, 3, 7}));
    for (int k = 0; k <= 10; k++) {
        size_t n = size_t(1) << k;
        std::vector<long long> v(n);
        for (size_t i = 0; i < n; i++) v[i] = static_cast<long long>(i);
        bitReversePermute(v);
        for (size_t i = 0; i < n; i++) {
            size_t rev = 0;
            for (int b = 0; b < k; b++) rev |= ((i >> b) & 1) << (k - 1 - b);
            assert(v[i] == static_cast<long long>(rev));
        }
        bitReversePermute(v);
        for (size_t i = 0; i < n; i++) assert(v[i] == static_cast<long long>(i));
    }
    std::vector<long long> empty;
    bitReversePermute(empty);
    assert(empty.empty());
}

void testPinnedTransforms() {
    for (const Transform& t : PINNED_TRANSFORMS) assert(ntt(t.a, t.inverse) == t.want);
}

void testAgainstDirectSum() {
    std::mt19937_64 rng(20261124);
    for (size_t n = 1; n <= 64; n++) {
        std::vector<long long> a = randomResidues(rng, n);
        std::vector<long long> padded = a;
        padded.resize(nextPowerOfTwo(n), 0);
        assert(ntt(a) == directTransform(padded, false));
        if (padded.size() == n) assert(intt(a) == directTransform(a, true));
    }
}

void testRoundTrip() {
    std::mt19937_64 rng(1);
    for (int k = 0; k <= 12; k++) {
        size_t n = size_t(1) << k;
        for (int rep = 0; rep < 3; rep++) {
            std::vector<long long> a = randomSigned(rng, n, 1000000000000LL);
            std::vector<long long> reduced(n);
            for (size_t i = 0; i < n; i++) reduced[i] = reduce(a[i]);
            assert(intt(ntt(a)) == reduced);
            assert(ntt(intt(a)) == reduced);
        }
    }
    for (size_t n : {3, 5, 6, 7, 9, 100, 1000}) {
        std::vector<long long> a = randomResidues(rng, n);
        std::vector<long long> padded = a;
        padded.resize(nextPowerOfTwo(n), 0);
        assert(intt(ntt(a)) == padded);
    }
}

void testTransformEdgeCases() {
    assert(ntt({}).empty() && intt({}).empty());
    assert((ntt({5}) == std::vector<long long>{5}));
    assert((intt({5}) == std::vector<long long>{5}));
    assert((ntt({-1}) == std::vector<long long>{static_cast<long long>(MOD - 1)}));
    assert(ntt({1, 2, 3}).size() == 4);
    std::vector<long long> delta(16, 0);
    delta[0] = 1;
    assert((ntt(delta) == std::vector<long long>(16, 1)));
    assert(throwsInvalid([] { intt({1, 2, 3}); }));
    std::vector<long long> tooLong(MAX_LENGTH + 1, 0);
    assert(throwsInvalid([&tooLong] { ntt(tooLong); }));
    std::vector<long long> empty, three = {1, 2, 3};
    assert(throwsInvalid([&empty] { nttInPlace(empty); }));
    assert(throwsInvalid([&three] { nttInPlace(three); }));
}

void testInPlaceAndButterflies() {
    std::vector<long long> a = {5, 1, 4, 2, 3, 0, 0, 7};
    std::vector<long long> want = ntt(a);
    const long long* data = a.data();
    assert(nttInPlace(a) == 12);
    assert(a.data() == data && a == want);
    assert(nttInPlace(a, true) == 12);
    assert((a == std::vector<long long>{5, 1, 4, 2, 3, 0, 0, 7}));
    std::mt19937_64 rng(3);
    for (int k = 0; k <= 16; k++) {
        size_t n = size_t(1) << k;
        for (bool inverse : {false, true}) {
            std::vector<long long> v = randomResidues(rng, n);
            assert(nttInPlace(v, inverse) == static_cast<long long>(n / 2) * k);
        }
    }
}

void testPinnedProducts() {
    for (const Product& t : PINNED_PRODUCTS) assert(multiplyPolynomials(t.p, t.q) == t.want);
    for (const Product& t : PINNED_PRODUCTS) assert(convolve(t.p, t.q) == t.want);
}

void testAgainstSchoolbook() {
    for (unsigned seed = 0; seed < 6; seed++) {
        std::mt19937_64 rng(seed);
        for (int rep = 0; rep < 60; rep++) {
            std::vector<long long> p = randomResidues(rng, 1 + rng() % 40);
            std::vector<long long> q = randomResidues(rng, 1 + rng() % 40);
            assert(multiplyPolynomials(p, q) == schoolbookMod(p, q));
            std::vector<long long> sp = randomSigned(rng, 1 + rng() % 20, 1000000000000000LL);
            std::vector<long long> sq = randomSigned(rng, 1 + rng() % 20, 1000000000000000LL);
            assert(multiplyPolynomials(sp, sq) == schoolbookMod(sp, sq));
        }
    }
    std::mt19937_64 rng(11);
    std::vector<long long> p = randomResidues(rng, 700), q = randomResidues(rng, 900);
    assert(multiplyPolynomials(p, q) == schoolbookMod(p, q));
}

void testProductEdgeCases() {
    using V = std::vector<long long>;
    assert(multiplyPolynomials({}, {}).empty());
    assert(multiplyPolynomials({}, {5}).empty());
    assert((multiplyPolynomials({}, {1, 2, 3}) == V{0, 0}));
    assert((multiplyPolynomials({1, 2, 3}, {}) == V{0, 0}));
    assert((multiplyPolynomials({7}, {3}) == V{21}));
    assert((multiplyPolynomials({0, 0, 0}, {1, 2}) == V{0, 0, 0, 0}));
    assert((multiplyPolynomials({0, 1, 0, 2}, {3, 0, 0, 0, 1}) == V{0, 3, 0, 6, 0, 1, 0, 2}));
    long long m1 = static_cast<long long>(MOD - 1);
    assert((multiplyPolynomials(V(5, m1), V(3, m1)) == V{1, 2, 3, 3, 3, 2, 1}));
    // 1000 coefficients of MOD - 1 on each side: every butterfly multiplies residues near 2^30.
    V ones = multiplyPolynomials(V(1000, m1), V(1000, m1));
    for (size_t k = 0; k < ones.size(); k++) assert(ones[k] == static_cast<long long>(k < 1000 ? k + 1 : 1999 - k));
    for (auto lengths : std::vector<std::pair<size_t, size_t>>{{3, 6}, {5, 5}, {2, 7}, {9, 8}, {33, 1}, {1, 1}}) {
        std::mt19937_64 rng(12);
        V p = randomResidues(rng, lengths.first), q = randomResidues(rng, lengths.second);
        V got = multiplyPolynomials(p, q);
        assert(got.size() == lengths.first + lengths.second - 1 && got == schoolbookMod(p, q));
    }
    assert((multiplyPolynomials({1000000000}, {1000000000}) == V{716070898}));  // 10^18 mod p
}

void testLengthLimit() {
    std::vector<long long> tooLong(MAX_LENGTH + 1, 0), longer(MAX_LENGTH + 2, 0);
    assert(throwsInvalid([&tooLong] { multiplyPolynomials({1}, tooLong); }));
    assert(throwsInvalid([&longer] { multiplyPolynomials({}, longer); }));
}

void testLargestTransform() {
    // 2^22 ones times 2^22 ones: 2^23 - 1 coefficients, so the transforms have the largest size,
    // 2^23. Coefficient k of (1 + x + ... + x^(m-1))^2 is min(k + 1, 2m - 1 - k).
    const size_t m = MAX_LENGTH / 2;
    std::vector<long long> ones(m, 1);
    std::vector<long long> got = multiplyPolynomials(ones, ones);
    assert(got.size() == 2 * m - 1);
    for (size_t k = 0; k < got.size(); k++) assert(got[k] == static_cast<long long>(k < m ? k + 1 : 2 * m - 1 - k));
}

void testAgainstTheFft() {
    for (const Product& t : PINNED_FFT_PRODUCTS) {
        std::vector<long long> reduced(t.want.size());
        for (size_t i = 0; i < t.want.size(); i++) reduced[i] = reduce(t.want[i]);
        assert(multiplyPolynomials(t.p, t.q) == reduced);
        bool nonNegative = true;
        for (long long x : t.want) nonNegative = nonNegative && x >= 0;
        if (nonNegative) assert(multiplyPolynomials(t.p, t.q) == t.want);
    }
}

int main() {
    testConstants();
    testRoots();
    testBitReversal();
    testPinnedTransforms();
    testAgainstDirectSum();
    testRoundTrip();
    testTransformEdgeCases();
    testInPlaceAndButterflies();
    testPinnedProducts();
    testAgainstSchoolbook();
    testProductEdgeCases();
    testLengthLimit();
    testLargestTransform();
    testAgainstTheFft();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
