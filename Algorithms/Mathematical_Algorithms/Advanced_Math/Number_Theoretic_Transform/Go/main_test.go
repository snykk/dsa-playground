package main

import (
	"errors"
	"math/rand"
	"slices"
	"testing"
)

// The pinned values (between the PINNED markers) were computed by the Python implementation
// (number_theoretic_transform.py), and the FFT rows by the Fast Fourier Transform topic's Python
// code. The rest checks the constants and the roots, the bit-reversal order, the transform
// against the direct O(n^2) sum, the round trip, the products against schoolbook multiplication
// modulo p on random inputs with fixed seeds, the edge cases, the length limit and the number of
// butterflies.

// PINNED (generated from Python)
var pinnedRoots = []int{1, 998244352, 911660635, 372528824, 929031873, 452798380, 922799308, 781712469, 476477967, 166035806, 258648936, 584193783, 63912897, 350007156, 666702199, 968855178, 629671588, 24514907, 996173970, 363395222, 565042129, 733596141, 267099868, 15311432}
var pinnedInverseRoots = []int{1, 998244352, 86583718, 509520358, 337190230, 87557064, 609441965, 135236158, 304459705, 685443576, 381598368, 335559352, 129292727, 358024708, 814576206, 708402881, 283043518, 3707709, 121392023, 704923114, 950391366, 428961804, 382752275, 469870224}
var pinnedTransforms = []struct {
	a       []int
	inverse bool
	want    []int
}{
	{[]int{1, 2, 3, 4}, false, []int{10, 173167434, 998244351, 825076915}},
	{[]int{10, 173167434, 998244351, 825076915}, true, []int{1, 2, 3, 4}},
	{[]int{1, 2, 3}, false, []int{6, 825076915, 2, 173167434}},
	{[]int{1, 0, 0, 0}, false, []int{1, 1, 1, 1}},
	{[]int{0, 1, 0, 0, 0, 0, 0, 0}, false, []int{1, 372528824, 911660635, 488723995, 998244352, 625715529, 86583718, 509520358}},
	{[]int{-1, -2, 998244353, 1996488711}, false, []int{2, 606086025, 998244349, 392158326}},
	{[]int{7}, false, []int{7}},
	{[]int{7}, true, []int{7}},
	{[]int{}, false, []int{}},
	{[]int{3, 1, 4, 1, 5, 9, 2, 6}, true, []int{124780548, 493639351, 531591071, 531554847, 374341632, 48774684, 965775459, 922519823}},
	{[]int{998244352, 998244352, 998244352, 998244352, 998244352, 998244352, 998244352, 998244352}, false, []int{998244345, 0, 0, 0, 0, 0, 0, 0}},
	{[]int{0, 0, 0, 0, 0}, false, []int{0, 0, 0, 0, 0, 0, 0, 0}},
}
var pinnedProducts = []struct{ p, q, want []int }{
	{[]int{1, 2, 3}, []int{4, 5}, []int{4, 13, 22, 15}},
	{[]int{1, 2}, []int{3, 4}, []int{3, 10, 8}},
	{[]int{1, 1}, []int{1, 1}, []int{1, 2, 1}},
	{[]int{1, -1}, []int{1, 1}, []int{1, 0, 998244352}},
	{[]int{7}, []int{3}, []int{21}},
	{[]int{0, 0, 0}, []int{1, 2}, []int{0, 0, 0, 0}},
	{[]int{998244352}, []int{998244352}, []int{1}},
	{[]int{998244351}, []int{998244351}, []int{4}},
	{[]int{1000000000}, []int{1000000000}, []int{716070898}},
	{[]int{998244352, 998244352, 998244352}, []int{998244352, 998244352, 998244352}, []int{1, 2, 3, 2, 1}},
	{[]int{}, []int{}, []int{}},
	{[]int{}, []int{5}, []int{}},
	{[]int{}, []int{1, 2, 3}, []int{0, 0}},
	{[]int{73000000, 11000000, 53000000}, []int{37000000, 55000000, 53000000}, []int{341870250, 124700719, 457102099, 53946344, 285319180}},
	{[]int{513482241851432, 557199649404724, -689701562258158}, []int{364763986864415}, []int{156006877, 84448884, 128875157}},
	{[]int{174701753, 815803213, 470640171, 455859625, 833829477, 899428560, 610471983, 264447564}, []int{81388382, 858196394, 778173936, 1123901, 626550836, 603134581, 951969108, 62045706}, []int{916651899, 832067120, 429623631, 441636299, 667283230, 149483799, 894564796, 813945941, 845529887, 814209156, 534825870, 802066329, 458002598, 950730472, 837359908}},
	{[]int{979156541679976, 703667613893372, 586358980894622}, []int{-206285851882509, -435600109478680, -829665580346804, -427942445020383, 450607288908882, 13260797753979, 671083937592369, -486853100743645}, []int{352794116, 650642188, 873166640, 625092310, 430654423, 599353972, 246947503, 250861814, 263700075, 239135680}},
	{[]int{289004029, 390657148, 864538194, 617952312, 150146627}, []int{541327917, 359936350, 32530654, 323450359, 47207602}, []int{943451058, 477157716, 658284736, 363893636, 586583963, 274262273, 698422387, 14208579, 229740070}},
	{[]int{-360281933104120, 754870022943244, 762759662579485}, []int{78682762227350}, []int{494196999, 817980251, 942126180}},
	{[]int{704637986, 459193484, 225091906, 339916553, 928792743, 206260116, 854608285}, []int{912847783, 193568233, 132650460, 214236412, 893025944, 906448526, 527615366, 688754812, 426478591}, []int{385822421, 678063864, 556649344, 202311026, 109036391, 626292097, 708587969, 697665422, 857230401, 511381131, 870316510, 988583453, 500280800, 974432622, 44917544}},
	{[]int{-624858587909436, 337229028354794, -29200234426278, 98954951743336}, []int{38652410700522, 87369893335831}, []int{18974628, 542150971, 615315614, 873521339, 447911107}},
	{[]int{36320684, 935265360, 527482364, 230738303, 598122500, 390693723, 531014839}, []int{178309328, 720494734}, []int{878116134, 584655623, 481798612, 625649100, 921150137, 193591092, 853552329, 461262751}},
	{[]int{539242430756195, -921289038790496, 906335246847371}, []int{-132745586536775, 430909158859669, 313015851672238, -981187660813596, -687313112203782, 233376486334631, -460890229956315, 711349850751952}, []int{757221103, 29215698, 688933757, 414991597, 736912126, 439384644, 128968789, 186780687, 954943416, 113918192}},
	{[]int{551177836, 81716027, 219121933, 36740516, 472221573, 952475305, 67030181}, []int{6561412, 361956802, 500243925, 305405517, 727125939, 508275223, 418886757, 209415858, 864903441}, []int{339333087, 446949034, 289428629, 871147792, 377376547, 186772332, 102467489, 56873613, 217599509, 170783204, 433265469, 647076486, 973401103, 506194104, 199290433}},
	{[]int{20991970444228, -535631256742840, -366907363457300, -951900667204255, 842160254225272, 543366462523492, -239483713961979}, []int{-125284477795740, 480130163700642, 673611396219667, -683697655508843}, []int{994699434, 993844095, 512343970, 263917616, 864636231, 654611430, 938703486, 662214793, 465030825, 490408959}},
	{[]int{231507137, 830864154, 594059364, 435643507}, []int{154275223, 65444942, 679601191, 615934497}, []int{829434514, 32018172, 782116316, 865270033, 636669583, 470892526, 884474286}},
	{[]int{-195468315661711, -24545784019289, -167766406366615, 954487550195733}, []int{-323306502316523}, []int{965422977, 771146116, 406860615, 949784718}},
	{[]int{325818962, 567542074, 604230884, 293853575}, []int{216746068, 777254679}, []int{700725876, 626352197, 307121796, 800203049, 475763498}},
	{[]int{824443358826364, -963870148853021}, []int{601324362029902, -30027934100713, 13810040812156}, []int{625757153, 893652148, 119171121, 722995485}},
	{[]int{573587572}, []int{141281530, 542547358, 619958790, 289998521, 421859741}, []int{924769404, 238161615, 316741288, 679915830, 766542789}},
	{[]int{-604741747369652, 786949188932010, 873430402139226, -610643453278240, -5904588595574, 885361222525853, 849188393193697}, []int{660443720146350, -204725263692897, 191824790298502, 850022492444012, 332869435078501, -359271623409558, 237183531719723, -921348037105415, 41339814652080}, []int{918700673, 443692569, 577022316, 474654469, 659989942, 550728961, 633313831, 108300239, 633681773, 298267730, 869649503, 657398709, 652851035, 95846390, 233451123}},
	{[]int{368322989, 516169477, 802198376, 797778220, 136245428, 366495498, 934682512, 525195632}, []int{720075302, 63520599, 542100936, 623026679, 322356841, 697648189}, []int{663982811, 536197593, 319254825, 815013363, 778826516, 613807822, 758512615, 179034175, 574137579, 747146396, 950444302, 88557012, 69067143}},
	{[]int{561161330685558, -237790892568510}, []int{352184196199134, 48753880501449, -218047573024277, -96307595178489, 803634358074074}, []int{463271876, 237362374, 408293636, 155062808, 54882733, 131230827}},
	{[]int{302330696, 535377421, 396462355, 761594805, 724797114, 12134759, 458499163, 658126815, 196131074}, []int{454475734, 87228243, 361775209, 805836267}, []int{580341710, 127852899, 449665414, 390063422, 663415113, 141280782, 536789872, 843836775, 824674553, 772138248, 443793404, 713497611}},
	{[]int{-151622543371402, -360987701046680, -303841604324896, 223155893585713, -434933962775571, 178435900333415}, []int{406475852417071, 296993992964483, -81164085438696, 383469254772566, -913230935519589}, []int{586144805, 983691262, 522243724, 380219087, 64911760, 832705488, 507649231, 772522072, 25711778, 614007157}},
	{[]int{277564327, 756218367, 747648320, 107955822, 718110841, 255227885, 520907610, 163317339}, []int{863904942, 947623215, 984661421, 771892976, 539118975, 741229112, 703527867, 660696401}, []int{397513627, 833698739, 295926894, 186193198, 635373996, 265437882, 679682562, 42601899, 913729861, 83924139, 472749953, 507611046, 604608915, 235020732, 163341236}},
	{[]int{613277454321906, -461008086099971, -524709423975339, -271340092054833, -641009489150330, 889061558871558, -70510677658615}, []int{750521991026093, -877959284975695, -924096986043693, -295147002604563, -877826529827058}, []int{324927204, 879223753, 468802819, 165236346, 742930299, 867523275, 958513018, 573001631, 615464277, 70985791, 28644256}},
	{[]int{641114443, 317530724, 137130721, 192735965, 377198006, 230282397, 286307268, 346699250}, []int{735316872, 162570296, 908877884, 997301091, 909983553}, []int{527035627, 82613879, 382167671, 386369007, 251885880, 333028063, 776725121, 422648622, 339110264, 395501050, 382311615, 634505163}},
	{[]int{-199842024119384, -232457200881645, -356750177991080, 729477470160864, 807039610893557, -912422583357510, 67646151328347}, []int{523922588557045, -455189444893458}, []int{879173462, 923280464, 113576170, 891430077, 456254321, 121964818, 320885887, 696314171}},
	{[]int{705080892, 225993636, 294341330, 797280795, 288935180, 621293535, 729747639, 376945911}, []int{408790588, 417277739, 824641819, 67288018, 363768375, 291653894, 752602613, 648481951}, []int{295826887, 205566888, 765890337, 344539641, 319503443, 924986949, 277794273, 378859774, 730916307, 881612495, 477955567, 269209173, 489459560, 362389375, 507673624}},
}

// The Fast Fourier Transform topic's multiply_polynomials (Python), rounded and exact here.
var pinnedFFTProducts = []struct{ p, q, want []int }{
	{[]int{1, 2, 3}, []int{4, 5}, []int{4, 13, 22, 15}},
	{[]int{1, 2}, []int{3, 4}, []int{3, 10, 8}},
	{[]int{99, 99, 99}, []int{99, -99, 99, -99, 99}, []int{9801, 0, 9801, -9801, 9801, 0, 9801}},
	{[]int{3, -1, 4, 1}, []int{5, 9, -2, 6}, []int{15, 22, 5, 61, -5, 22, 6}},
	{[]int{1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000}, []int{1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000}, []int{1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000, 11000000, 12000000, 13000000, 14000000, 15000000, 16000000, 15000000, 14000000, 13000000, 12000000, 11000000, 10000000, 9000000, 8000000, 7000000, 6000000, 5000000, 4000000, 3000000, 2000000, 1000000}},
	{[]int{0}, []int{5, 5}, []int{0, 0}},
	{[]int{-99, 0, 0, 0, 0, 0, 0, 99}, []int{1}, []int{-99, 0, 0, 0, 0, 0, 0, 99}},
	{[]int{941, -692, -192, 333, -902, -852}, []int{-808, -252, 193, -882, 863, 39, -561, -924, -824}, []int{-760328, 322004, 511133, -1184198, 2030271, 588836, -973673, 429747, -42239, -209651, 323310, 1037028, 1530496, 702048}},
	{[]int{-144, -857, -508, -815, 128, -131, -879}, []int{-747, 940, -543, 291, 284, 193, 940, -874, 181, 199}, []int{107568, 504819, -347912, 554732, -876155, 241714, -218229, -1727107, 563667, -774170, 295220, -653266, -850783, 770007, -185168, -174921}},
	{[]int{-899, 999, -548, -905, 140, 758, -728}, []int{-142, -705, 107, -759, 169}, []int{127658, 491937, -722672, 1304084, -350663, 281592, 178249, 335141, -629558, 680654, -123032}},
	{[]int{147, 671, 396, -630, -789}, []int{169, 308, -616, -238, -801, 121, 458, -872, 155, -878}, []int{24843, 158675, 183040, -432824, -848762, -468864, 467285, 919462, 174800, -754382, -339760, 242670, 430845, 692742}},
	{[]int{-579, 16, 393, 88, -125, 591, -357, -47, 199, 891}, []int{-260, -387, -492, 626, -632, 431, 597, -501}, []int{150540, 219913, 176496, -545297, 181032, -162224, -606452, 194755, 855592, -1080775, -110515, -22509, -97479, -326545, 526371, 432228, -446391}},
}

// END PINNED

func mustNTT(t *testing.T, a []int, inverse bool) []int {
	t.Helper()
	out, err := NTT(a, inverse)
	if err != nil {
		t.Fatalf("NTT(%v, %v): %v", a, inverse, err)
	}
	return out
}

func mustMultiply(t *testing.T, p, q []int) []int {
	t.Helper()
	out, err := MultiplyPolynomials(p, q)
	if err != nil {
		t.Fatalf("MultiplyPolynomials(%v, %v): %v", p, q, err)
	}
	return out
}

func mustRoot(t *testing.T, n int, inverse bool) int {
	t.Helper()
	w, err := RootOfUnity(n, inverse)
	if err != nil {
		t.Fatalf("RootOfUnity(%d): %v", n, err)
	}
	return w
}

// directTransform is the definition, X[k] = sum_j a[j] w^(jk) mod Mod, in O(n^2).
func directTransform(t *testing.T, a []int, inverse bool) []int {
	n := len(a)
	w := mustRoot(t, n, inverse)
	out := make([]int, n)
	for k := 0; k < n; k++ {
		sum, wk, power := 0, PowMod(w, k), 1
		for j := 0; j < n; j++ {
			sum = (sum + MulMod(reduce(a[j]), power)) % Mod
			power = MulMod(power, wk)
		}
		out[k] = sum
	}
	if inverse {
		nInverse := PowMod(n, Mod-2)
		for i := range out {
			out[i] = MulMod(out[i], nInverse)
		}
	}
	return out
}

// schoolbookMod is the product modulo Mod in O(len(p) * len(q)), with MultiplyPolynomials' lengths.
func schoolbookMod(p, q []int) []int {
	out := make([]int, max(0, len(p)+len(q)-1))
	if len(p) == 0 || len(q) == 0 {
		return out
	}
	for i, x := range p {
		for j, y := range q {
			out[i+j] = (out[i+j] + MulMod(reduce(x), reduce(y))) % Mod
		}
	}
	return out
}

func randomResidues(rng *rand.Rand, n int) []int {
	v := make([]int, n)
	for i := range v {
		v[i] = rng.Intn(Mod)
	}
	return v
}

func randomSigned(rng *rand.Rand, n int, bound int64) []int {
	v := make([]int, n)
	for i := range v {
		v[i] = int(rng.Int63n(2*bound+1) - bound)
	}
	return v
}

func nextPowerOfTwo(n int) int {
	size := 1
	for size < n {
		size <<= 1
	}
	return size
}

func repeat(x, n int) []int {
	v := make([]int, n)
	for i := range v {
		v[i] = x
	}
	return v
}

func padded(a []int, n int) []int {
	out := make([]int, n)
	copy(out, a)
	return out
}

func TestConstants(t *testing.T) {
	if Mod != 119*(1<<23)+1 || Mod-1 != (1<<23)*7*17 {
		t.Fatal("Mod is not 119 * 2^23 + 1 = 2^23 * 7 * 17 + 1")
	}
	for d := 2; d*d <= Mod; d++ {
		if Mod%d == 0 {
			t.Fatalf("Mod is divisible by %d", d)
		}
	}
	for _, q := range []int{2, 7, 17} {
		if PowMod(PrimitiveRoot, (Mod-1)/q) == 1 {
			t.Fatalf("3^((Mod-1)/%d) = 1: 3 would not be a primitive root", q)
		}
	}
	if MaxLength != 1<<23 || (Mod-1)%MaxLength != 0 || (Mod-1)%(2*MaxLength) == 0 {
		t.Fatal("MaxLength is not the largest power of two dividing Mod - 1")
	}
	if MulMod(Mod-1, Mod-1) != 1 || MulMod(Mod-2, Mod-2) != 4 {
		t.Fatal("MulMod overflowed")
	}
}

func TestRoots(t *testing.T) {
	for k := 0; k < 24; k++ {
		n := 1 << k
		w := mustRoot(t, n, false)
		inv := mustRoot(t, n, true)
		if w != pinnedRoots[k] || inv != pinnedInverseRoots[k] {
			t.Fatalf("RootOfUnity(2^%d) = %d, %d; want %d, %d", k, w, inv, pinnedRoots[k], pinnedInverseRoots[k])
		}
		if PowMod(w, n) != 1 || (n >= 2 && PowMod(w, n/2) != Mod-1) || MulMod(w, inv) != 1 {
			t.Fatalf("RootOfUnity(2^%d) is not a primitive root of order 2^%d", k, k)
		}
		if k >= 1 && MulMod(w, w) != mustRoot(t, n/2, false) {
			t.Fatalf("squaring the 2^%d-th root does not give the 2^%d-th", k, k-1)
		}
	}
	for _, bad := range []int{0, -4, 3, 6} {
		if _, err := RootOfUnity(bad, false); !errors.Is(err, ErrNotPowerOfTwo) {
			t.Fatalf("RootOfUnity(%d): got %v, want ErrNotPowerOfTwo", bad, err)
		}
	}
	if _, err := RootOfUnity(1<<24, false); !errors.Is(err, ErrTooLong) {
		t.Fatalf("RootOfUnity(2^24): got %v, want ErrTooLong", err)
	}
}

func TestBitReversal(t *testing.T) {
	a := []int{0, 1, 2, 3, 4, 5, 6, 7}
	BitReversePermute(a)
	if !slices.Equal(a, []int{0, 4, 2, 6, 1, 5, 3, 7}) {
		t.Fatalf("BitReversePermute(0..7) = %v", a)
	}
	for k := 0; k <= 10; k++ {
		n := 1 << k
		v := make([]int, n)
		for i := range v {
			v[i] = i
		}
		BitReversePermute(v)
		for i := 0; i < n; i++ {
			rev := 0
			for b := 0; b < k; b++ {
				rev |= ((i >> b) & 1) << (k - 1 - b)
			}
			if v[i] != rev {
				t.Fatalf("n = %d: position %d holds %d, want %d", n, i, v[i], rev)
			}
		}
		BitReversePermute(v)
		for i := 0; i < n; i++ {
			if v[i] != i {
				t.Fatalf("n = %d: two reversals are not the identity", n)
			}
		}
	}
	BitReversePermute([]int{})
}

func TestPinnedTransforms(t *testing.T) {
	for _, c := range pinnedTransforms {
		if got := mustNTT(t, c.a, c.inverse); !slices.Equal(got, c.want) {
			t.Fatalf("NTT(%v, %v) = %v, want %v", c.a, c.inverse, got, c.want)
		}
	}
}

func TestAgainstDirectSum(t *testing.T) {
	rng := rand.New(rand.NewSource(20261124))
	for n := 1; n <= 64; n++ {
		a := randomResidues(rng, n)
		size := nextPowerOfTwo(n)
		if got, want := mustNTT(t, a, false), directTransform(t, padded(a, size), false); !slices.Equal(got, want) {
			t.Fatalf("n = %d: NTT = %v, direct = %v", n, got, want)
		}
		if size == n {
			if got, want := mustNTT(t, a, true), directTransform(t, a, true); !slices.Equal(got, want) {
				t.Fatalf("n = %d: INTT = %v, direct = %v", n, got, want)
			}
		}
	}
}

func TestRoundTrip(t *testing.T) {
	rng := rand.New(rand.NewSource(1))
	for k := 0; k <= 12; k++ {
		n := 1 << k
		for rep := 0; rep < 3; rep++ {
			a := randomSigned(rng, n, 1_000_000_000_000)
			reduced := make([]int, n)
			for i, x := range a {
				reduced[i] = reduce(x)
			}
			back, err := INTT(mustNTT(t, a, false))
			if err != nil || !slices.Equal(back, reduced) {
				t.Fatalf("n = %d: INTT(NTT(a)) != a mod p (%v)", n, err)
			}
			if !slices.Equal(mustNTT(t, mustNTT(t, a, true), false), reduced) {
				t.Fatalf("n = %d: NTT(INTT(a)) != a mod p", n)
			}
		}
	}
	for _, n := range []int{3, 5, 6, 7, 9, 100, 1000} {
		a := randomResidues(rng, n)
		back, err := INTT(mustNTT(t, a, false))
		if err != nil || !slices.Equal(back, padded(a, nextPowerOfTwo(n))) {
			t.Fatalf("n = %d: the padded round trip failed (%v)", n, err)
		}
	}
}

func TestTransformEdgeCases(t *testing.T) {
	if got := mustNTT(t, []int{}, false); len(got) != 0 || got == nil {
		t.Fatalf("NTT([]) = %#v, want an empty slice", got)
	}
	if got := mustNTT(t, nil, true); len(got) != 0 {
		t.Fatalf("INTT(nil) = %v", got)
	}
	if !slices.Equal(mustNTT(t, []int{5}, false), []int{5}) || !slices.Equal(mustNTT(t, []int{5}, true), []int{5}) {
		t.Fatal("one value is its own transform")
	}
	if !slices.Equal(mustNTT(t, []int{-1}, false), []int{Mod - 1}) {
		t.Fatal("-1 is not reduced to Mod - 1")
	}
	if len(mustNTT(t, []int{1, 2, 3}, false)) != 4 {
		t.Fatal("a forward transform of 3 values is not padded to 4")
	}
	delta := make([]int, 16)
	delta[0] = 1
	if got := mustNTT(t, delta, false); !slices.Equal(got, repeat(1, 16)) {
		t.Fatalf("NTT(delta) = %v", got)
	}
	if _, err := INTT([]int{1, 2, 3}); !errors.Is(err, ErrNotPowerOfTwo) {
		t.Fatalf("INTT([1 2 3]): got %v, want ErrNotPowerOfTwo", err)
	}
	if _, err := NTT(make([]int, MaxLength+1), false); !errors.Is(err, ErrTooLong) {
		t.Fatalf("NTT of 2^23 + 1 values: got %v, want ErrTooLong", err)
	}
	for _, bad := range [][]int{{}, {1, 2, 3}} {
		if _, err := NTTInPlace(bad, false); !errors.Is(err, ErrNotPowerOfTwo) {
			t.Fatalf("NTTInPlace(%v): got %v, want ErrNotPowerOfTwo", bad, err)
		}
	}
}

func TestInPlaceAndButterflies(t *testing.T) {
	a := []int{5, 1, 4, 2, 3, 0, 0, 7}
	want := mustNTT(t, a, false)
	first := &a[0]
	if count, err := NTTInPlace(a, false); err != nil || count != 12 || &a[0] != first || !slices.Equal(a, want) {
		t.Fatalf("NTTInPlace: %d butterflies, %v, %v", count, a, err)
	}
	if count, _ := NTTInPlace(a, true); count != 12 || !slices.Equal(a, []int{5, 1, 4, 2, 3, 0, 0, 7}) {
		t.Fatalf("the inverse did not restore the input: %v", a)
	}
	rng := rand.New(rand.NewSource(3))
	for k := 0; k <= 16; k++ {
		n := 1 << k
		for _, inverse := range []bool{false, true} {
			count, err := NTTInPlace(randomResidues(rng, n), inverse)
			if err != nil || count != n/2*k {
				t.Fatalf("n = %d: %d butterflies, want %d (%v)", n, count, n/2*k, err)
			}
		}
	}
}

func TestPinnedProducts(t *testing.T) {
	for _, c := range pinnedProducts {
		if got := mustMultiply(t, c.p, c.q); !slices.Equal(got, c.want) {
			t.Fatalf("MultiplyPolynomials(%v, %v) = %v, want %v", c.p, c.q, got, c.want)
		}
		if got, _ := Convolve(c.p, c.q); !slices.Equal(got, c.want) {
			t.Fatalf("Convolve(%v, %v) = %v", c.p, c.q, got)
		}
	}
}

func TestAgainstSchoolbook(t *testing.T) {
	for seed := int64(0); seed < 6; seed++ {
		rng := rand.New(rand.NewSource(seed))
		for rep := 0; rep < 60; rep++ {
			p, q := randomResidues(rng, 1+rng.Intn(40)), randomResidues(rng, 1+rng.Intn(40))
			if got, want := mustMultiply(t, p, q), schoolbookMod(p, q); !slices.Equal(got, want) {
				t.Fatalf("seed %d: %v * %v = %v, want %v", seed, p, q, got, want)
			}
			sp := randomSigned(rng, 1+rng.Intn(20), 1_000_000_000_000_000)
			sq := randomSigned(rng, 1+rng.Intn(20), 1_000_000_000_000_000)
			if got, want := mustMultiply(t, sp, sq), schoolbookMod(sp, sq); !slices.Equal(got, want) {
				t.Fatalf("seed %d: %v * %v = %v, want %v", seed, sp, sq, got, want)
			}
		}
	}
	rng := rand.New(rand.NewSource(11))
	p, q := randomResidues(rng, 700), randomResidues(rng, 900)
	if !slices.Equal(mustMultiply(t, p, q), schoolbookMod(p, q)) {
		t.Fatal("700 x 900 coefficients: the product differs from schoolbook")
	}
}

func TestProductEdgeCases(t *testing.T) {
	cases := []struct{ p, q, want []int }{
		{[]int{}, []int{}, []int{}},
		{nil, []int{5}, []int{}},
		{[]int{}, []int{1, 2, 3}, []int{0, 0}},
		{[]int{1, 2, 3}, nil, []int{0, 0}},
		{[]int{7}, []int{3}, []int{21}},
		{[]int{0, 0, 0}, []int{1, 2}, []int{0, 0, 0, 0}},
		{[]int{0, 1, 0, 2}, []int{3, 0, 0, 0, 1}, []int{0, 3, 0, 6, 0, 1, 0, 2}},
		{repeat(Mod-1, 5), repeat(Mod-1, 3), []int{1, 2, 3, 3, 3, 2, 1}},
		{[]int{1_000_000_000}, []int{1_000_000_000}, []int{716070898}},
	}
	for _, c := range cases {
		if got := mustMultiply(t, c.p, c.q); !slices.Equal(got, c.want) || got == nil {
			t.Fatalf("MultiplyPolynomials(%v, %v) = %#v, want %v", c.p, c.q, got, c.want)
		}
	}
	// 1000 coefficients of Mod - 1 on each side: every butterfly multiplies residues near 2^30.
	ones := mustMultiply(t, repeat(Mod-1, 1000), repeat(Mod-1, 1000))
	for k, x := range ones {
		want := k + 1
		if k >= 1000 {
			want = 1999 - k
		}
		if x != want {
			t.Fatalf("coefficient %d = %d, want %d", k, x, want)
		}
	}
	for _, l := range [][2]int{{3, 6}, {5, 5}, {2, 7}, {9, 8}, {33, 1}, {1, 1}} {
		rng := rand.New(rand.NewSource(12))
		p, q := randomResidues(rng, l[0]), randomResidues(rng, l[1])
		if got := mustMultiply(t, p, q); len(got) != l[0]+l[1]-1 || !slices.Equal(got, schoolbookMod(p, q)) {
			t.Fatalf("lengths %v: wrong product", l)
		}
	}
}

func TestLengthLimit(t *testing.T) {
	if _, err := MultiplyPolynomials([]int{1}, make([]int, MaxLength+1)); !errors.Is(err, ErrTooLong) {
		t.Fatalf("2^23 + 1 coefficients: got %v, want ErrTooLong", err)
	}
	if _, err := MultiplyPolynomials(nil, make([]int, MaxLength+2)); !errors.Is(err, ErrTooLong) {
		t.Fatalf("an empty p and a long q: got %v, want ErrTooLong", err)
	}
}

func TestLargestTransform(t *testing.T) {
	// 2^22 ones times 2^22 ones: 2^23 - 1 coefficients, so the transforms have the largest size,
	// 2^23. Coefficient k of (1 + x + ... + x^(m-1))^2 is min(k + 1, 2m - 1 - k).
	m := MaxLength / 2
	ones := repeat(1, m)
	got := mustMultiply(t, ones, ones)
	if len(got) != 2*m-1 {
		t.Fatalf("%d coefficients", len(got))
	}
	for k, x := range got {
		if x != min(k+1, 2*m-1-k) {
			t.Fatalf("coefficient %d = %d", k, x)
		}
	}
}

func TestAgainstTheFFT(t *testing.T) {
	for _, c := range pinnedFFTProducts {
		reduced := make([]int, len(c.want))
		nonNegative := true
		for i, x := range c.want {
			reduced[i] = reduce(x)
			nonNegative = nonNegative && x >= 0
		}
		got := mustMultiply(t, c.p, c.q)
		if !slices.Equal(got, reduced) || (nonNegative && !slices.Equal(got, c.want)) {
			t.Fatalf("%v * %v: NTT %v, FFT %v", c.p, c.q, got, c.want)
		}
	}
}
